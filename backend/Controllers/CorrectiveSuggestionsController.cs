using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/corrective-suggestions")]
    public class CorrectiveSuggestionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public CorrectiveSuggestionsController(ApplicationDbContext db) => _db = db;

        // Rule-based suggestions for one report
        private static List<(string Text, int Days)> Build(Report r)
        {
            var list = new List<(string Text, int Days)>();
            var d = (r.Description ?? string.Empty).ToLower();

            if (r.ComplianceStatus == "Non-Compliant")
                list.Add(("Investigate the cause of the non-compliance and correct it immediately", 3));
            else if (r.ComplianceStatus == "Under Review")
                list.Add(("Review the inspector's findings and submit evidence of compliance", 7));

            if (r.ActiveViolations > 0)
                list.Add(($"Resolve the {r.ActiveViolations} active violation(s) recorded in this report",
                          r.ComplianceStatus == "Non-Compliant" ? 5 : 10));

            if (r.RiskLevel == "High")
                list.Add(("Increase monitoring frequency and assign a responsible person until the risk is reduced", 2));
            else if (r.RiskLevel == "Medium")
                list.Add(("Schedule preventive maintenance and review readings weekly", 14));

            if (new[] { "air", "emission", "smoke", "dust", "gas" }.Any(d.Contains))
                list.Add(("Inspect and clean air filters, scrubbers and stacks to reduce emissions", 7));

            if (new[] { "water", "effluent", "ph", "discharge" }.Any(d.Contains))
                list.Add(("Check the effluent treatment plant and neutralise water before discharge", 7));

            if (new[] { "waste", "disposal" }.Any(d.Contains))
                list.Add(("Correct waste segregation and use an authorised disposal method", 5));

            if (d.Contains("noise"))
                list.Add(("Install noise insulation or provide protective equipment", 14));

            if (new[] { "temperature", "heat", "cooling" }.Any(d.Contains))
                list.Add(("Check cooling and ventilation systems", 7));

            return list;
        }

        // GET api/corrective-suggestions/{managerId}
        [HttpGet("{managerId:int}")]
        public async Task<IActionResult> Get(int managerId)
        {
            var manager = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");
            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var reports = await _db.Reports.AsNoTracking()
                .Where(r => r.IndustryId == industryId)
                .OrderByDescending(r => r.ReportDate)
                .Take(10)
                .ToListAsync();

            var existing = await _db.CorrectiveActions.AsNoTracking()
                .Where(c => c.IndustryId == industryId)
                .Select(c => new { c.ReportId, c.Description })
                .ToListAsync();
            var existingSet = existing
                .Select(e => e.ReportId + "|" + (e.Description ?? "").Trim())
                .ToHashSet();

            var result = new List<object>();

            foreach (var r in reports)
            {
                var items = Build(r)
                    .Where(s => !existingSet.Contains(r.Id + "|" + s.Text))
                    .Select(s => new
                    {
                        text = s.Text,
                        dueInDays = s.Days,
                        dueDate = DateTime.Today.AddDays(s.Days).ToString("yyyy-MM-dd")
                    })
                    .ToList();

                if (items.Count == 0) continue;

                string priority = r.ComplianceStatus == "Non-Compliant" || r.RiskLevel == "High" ? "High"
                                : r.ComplianceStatus == "Under Review" || r.RiskLevel == "Medium" ? "Medium"
                                : "Low";

                result.Add(new
                {
                    reportId = r.Id,
                    reportType = r.ReportType,
                    reportDate = r.ReportDate,
                    complianceStatus = r.ComplianceStatus,
                    riskLevel = r.RiskLevel,
                    activeViolations = r.ActiveViolations,
                    priority,
                    suggestions = items
                });
            }

            return Ok(new
            {
                count = result.Sum(x => ((dynamic)x).suggestions.Count),
                reports = result
            });
        }
    }
}