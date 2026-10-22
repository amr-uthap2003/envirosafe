using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    public class CreateManualRecommendationDto
    {
        public string SourceType { get; set; } = string.Empty;   // "Employee" or "Inspector"
        public int SourceId { get; set; }
        public string Text { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/industry-manager")]
    public class IndustryManagerController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public IndustryManagerController(ApplicationDbContext db) => _db = db;

        // GET api/industry-manager/{managerId}/reports
        [HttpGet("{managerId:int}/reports")]
        public async Task<IActionResult> GetIndustryReports(int managerId)
        {
            var manager = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");

            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var employeeIds = await _db.Users
                .AsNoTracking()
                .Where(u => u.AssignedIndustryId == industryId && u.Role == "Employee")
                .Select(u => u.Id)
                .ToListAsync();

            var employeeReadings = await _db.EnvironmentalReadings
                .AsNoTracking()
                .Where(r => employeeIds.Contains(r.SubmittedByUserId))
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();

            var inspectorReports = await _db.Reports
                .AsNoTracking()
                .Where(r => r.IndustryId == industryId)
                .OrderByDescending(r => r.ReportDate)
                .ToListAsync();

            var industry = await _db.Industries
                .AsNoTracking()
                .Where(i => i.Id == industryId)
                .Select(i => new { i.Name, i.Type })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                industryId,
                industryName = industry?.Name,
                industryType = industry?.Type,
                employeeReadings,
                inspectorReports
            });
        }

        // GET api/industry-manager/{managerId}/manual-recommendations
        [HttpGet("{managerId:int}/manual-recommendations")]
        public async Task<IActionResult> GetManualRecommendations(int managerId)
        {
            var manager = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");

            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var list = await _db.ManualRecommendations
                .AsNoTracking()
                .Where(m => m.IndustryId == industryId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }

        // POST api/industry-manager/{managerId}/manual-recommendations
        [HttpPost("{managerId:int}/manual-recommendations")]
        public async Task<IActionResult> AddManualRecommendation(
            int managerId, [FromBody] CreateManualRecommendationDto dto)
        {
            var manager = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");

            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var text = (dto.Text ?? string.Empty).Trim();
            if (text.Length == 0) return BadRequest("Recommendation text is required.");
            if (text.Length > 1000) return BadRequest("Recommendation is too long (max 1000 characters).");

            // The reading / report must belong to this manager's industry
            if (dto.SourceType == "Employee")
            {
                var reading = await _db.EnvironmentalReadings
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.Id == dto.SourceId);
                if (reading == null) return NotFound("Reading not found.");

                var belongs = await _db.Users.AnyAsync(u =>
                    u.Id == reading.SubmittedByUserId && u.AssignedIndustryId == industryId);
                if (!belongs) return BadRequest("This reading is not from your industry.");
            }
            else if (dto.SourceType == "Inspector")
            {
                var report = await _db.Reports
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.Id == dto.SourceId);
                if (report == null) return NotFound("Report not found.");
                if (report.IndustryId != industryId)
                    return BadRequest("This report is not from your industry.");
            }
            else
            {
                return BadRequest("SourceType must be 'Employee' or 'Inspector'.");
            }

            var rec = new ManualRecommendation
            {
                IndustryId = industryId,
                SourceType = dto.SourceType,
                SourceId = dto.SourceId,
                Text = text,
                CreatedByUserId = manager.Id,
                CreatedByName = manager.FullName,   // change if your User property has another name
                CreatedAt = DateTime.UtcNow
            };

            _db.ManualRecommendations.Add(rec);
            await _db.SaveChangesAsync();

            return Ok(rec);
        }

        // DELETE api/industry-manager/{managerId}/manual-recommendations/{id}
        [HttpDelete("{managerId:int}/manual-recommendations/{id:int}")]
        public async Task<IActionResult> DeleteManualRecommendation(int managerId, int id)
        {
            var manager = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");

            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var rec = await _db.ManualRecommendations
                .FirstOrDefaultAsync(m => m.Id == id && m.IndustryId == manager.AssignedIndustryId.Value);

            if (rec == null) return NotFound("Recommendation not found.");

            _db.ManualRecommendations.Remove(rec);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // GET api/industry-manager/{managerId}/compliance-status
        [HttpGet("{managerId:int}/compliance-status")]
        public async Task<IActionResult> GetComplianceStatus(int managerId)
        {
            var manager = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");

            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var industry = await _db.Industries.FirstOrDefaultAsync(i => i.Id == industryId);
            if (industry == null) return NotFound("Industry not found.");

            var employeeIds = await _db.Users
                .AsNoTracking()
                .Where(u => u.AssignedIndustryId == industryId && u.Role == "Employee")
                .Select(u => u.Id)
                .ToListAsync();

            var latestReading = await _db.EnvironmentalReadings
                .AsNoTracking()
                .Where(r => employeeIds.Contains(r.SubmittedByUserId))
                .OrderByDescending(r => r.SubmittedAt)
                .FirstOrDefaultAsync();

            var readingViolations = latestReading == null
                ? new List<string>()
                : CheckReading(latestReading);

            var latestReport = await _db.Reports
                .AsNoTracking()
                .Where(r => r.IndustryId == industryId)
                .OrderByDescending(r => r.ReportDate)
                .FirstOrDefaultAsync();

            string status;
            if (readingViolations.Count > 0 || latestReport?.ComplianceStatus == "Non-Compliant")
                status = "Non-Compliant";
            else if (latestReading == null && latestReport == null)
                status = "Under Review";
            else if (latestReport?.ComplianceStatus == "Under Review")
                status = "Under Review";
            else
                status = "Compliant";

            var totalViolations = readingViolations.Count + (latestReport?.ActiveViolations ?? 0);
            var risk = totalViolations == 0 ? "Low" : totalViolations <= 2 ? "Medium" : "High";
            if (latestReport?.RiskLevel == "High") risk = "High";

            industry.ComplianceStatus = status;
            industry.RiskLevel = risk;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                industryName = industry.Name,
                status,
                riskLevel = risk,
                activeViolations = totalViolations,
                readingViolations,
                latestReadingAt = latestReading?.SubmittedAt,
                inspectorStatus = latestReport?.ComplianceStatus ?? "No inspection yet",
                inspectorRisk = latestReport?.RiskLevel,
                inspectorViolations = latestReport?.ActiveViolations ?? 0,
                lastInspectionDate = latestReport?.ReportDate
            });
        }

        private static List<string> CheckReading(EnvironmentalReading r)
        {
            var v = new List<string>();
            if (r.AirQuality > 100) v.Add($"Air quality {r.AirQuality} exceeds limit (100)");
            if (r.WaterPh < 6.5 || r.WaterPh > 8.5) v.Add($"Water pH {r.WaterPh} outside 6.5–8.5");
            if (r.NoiseLevel > 75) v.Add($"Noise {r.NoiseLevel} dB exceeds limit (75)");
            if (r.Temperature > 40) v.Add($"Temperature {r.Temperature}°C exceeds limit (40)");
            if (r.WasteDisposal == "Improper") v.Add("Improper waste disposal");
            return v;
        }
    }
}