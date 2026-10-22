using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/report-prediction")]
    public class ReportPredictionController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public ReportPredictionController(ApplicationDbContext db) => _db = db;

        private static int StatusScore(string? s) =>
            s == "Non-Compliant" ? 100 : s == "Under Review" ? 50 : 0;

        // RULE-BASED prediction of the NEXT report, using the reports up to now
        private static (string predicted, int chance, string trend, string rule) Predict(List<Report> reports)
        {
            var last = reports[^1];
            var window = reports.TakeLast(3).ToList();
            int ncInWindow = window.Count(r => r.ComplianceStatus == "Non-Compliant");

            // Rule 1: points from the latest status
            int statusPts = last.ComplianceStatus == "Non-Compliant" ? 50
                          : last.ComplianceStatus == "Under Review" ? 25 : 0;
            // Rule 2: 10 points per active violation (max 30)
            int violationPts = Math.Min(30, last.ActiveViolations * 10);
            // Rule 3: 10 points per Non-Compliant report in the last 3
            int historyPts = ncInWindow * 10;

            int chance = Math.Min(100, statusPts + violationPts + historyPts);

            // Rule 4: points decide the predicted status
            string predicted = chance >= 60 ? "Non-Compliant"
                             : chance >= 25 ? "Under Review" : "Compliant";

            // Rule 5: trend = latest status compared with the previous one
            string trend = "Stable";
            if (reports.Count >= 2)
            {
                int delta = StatusScore(last.ComplianceStatus) - StatusScore(reports[^2].ComplianceStatus);
                trend = delta > 0 ? "Worsening" : delta < 0 ? "Improving" : "Stable";
            }

            string rule = $"Latest {last.ComplianceStatus} (+{statusPts}), " +
                          $"{last.ActiveViolations} violation(s) (+{violationPts}), " +
                          $"{ncInWindow} Non-Compliant in last 3 (+{historyPts}) = {chance}";

            return (predicted, chance, trend, rule);
        }

        // GET api/report-prediction/{managerId}
        [HttpGet("{managerId:int}")]
        public async Task<IActionResult> Get(int managerId)
        {
            var manager = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");
            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var recent = await _db.Reports.AsNoTracking()
                .Where(r => r.IndustryId == industryId)
                .OrderByDescending(r => r.ReportDate)
                .Take(6)
                .ToListAsync();

            if (recent.Count == 0)
                return Ok(new { hasData = false, message = "No inspector reports yet for this industry." });

            var submitterIds = recent.Select(r => r.SubmittedByUserId).Distinct().ToList();
            var roleById = await _db.Users.AsNoTracking()
                .Where(u => submitterIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Role);

            var asc = recent.OrderBy(r => r.ReportDate).ToList();
            var latest = recent.First();

            // Overall prediction for the next (future) report
            var overall = Predict(asc);

            // Prediction for EACH report, using only the reports up to that one
            var perReport = asc.Select((r, i) =>
            {
                var p = Predict(asc.Take(i + 1).ToList());
                string? actualNext = i < asc.Count - 1 ? asc[i + 1].ComplianceStatus : null;
                return new
                {
                    date = r.ReportDate,
                    reportType = r.ReportType,
                    submittedBy = string.IsNullOrWhiteSpace(r.SubmittedByName) ? "Unknown" : r.SubmittedByName,
                    submittedRole = roleById.TryGetValue(r.SubmittedByUserId, out var role) ? role : "Inspector",
                    status = r.ComplianceStatus,
                    activeViolations = r.ActiveViolations,
                    basedOn = i + 1,
                    predictedNext = p.predicted,
                    nonCompliantChance = p.chance,
                    trend = p.trend,
                    rule = p.rule,
                    actualNext,
                    correct = actualNext == null ? (bool?)null : actualNext == p.predicted
                };
            }).ToList();

            int checkedCount = perReport.Count(x => x.correct != null);
            int correctCount = perReport.Count(x => x.correct == true);

            return Ok(new
            {
                hasData = true,
                reliable = true,
                reportCount = asc.Count,
                compliant = asc.Count(r => r.ComplianceStatus == "Compliant"),
                underReview = asc.Count(r => r.ComplianceStatus == "Under Review"),
                nonCompliant = asc.Count(r => r.ComplianceStatus == "Non-Compliant"),
                latestStatus = latest.ComplianceStatus,
                activeViolations = latest.ActiveViolations,
                predictedStatus = overall.predicted,
                nonCompliantChance = overall.chance,
                trend = overall.trend,
                checkedCount,
                correctCount,
                history = asc.Select(r => new { date = r.ReportDate, status = r.ComplianceStatus }),
                perReport
            });
        }
    }
}