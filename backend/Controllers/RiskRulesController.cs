using EnviroSafe.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/risk-rules")]
    public class RiskRulesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public RiskRulesController(ApplicationDbContext db) => _db = db;

        private sealed record Item(string Parameter, string Value, string Status, string Reason);

        // Rule: value above limit = High, within 10% of limit = Medium, else Low
        private static Item Upper(string name, double v, double limit, string unit)
        {
            string u = unit == "" ? "" : " " + unit;
            if (v > limit)
                return new(name, $"{v}{u}", "High", $"{v} exceeds the limit of {limit}{u}");
            if (v >= 0.9 * limit)
                return new(name, $"{v}{u}", "Medium", $"{v} is within 10% of the limit of {limit}{u}");
            return new(name, $"{v}{u}", "Low", $"{v} is well within the limit of {limit}{u}");
        }

        // GET api/risk-rules/{managerId}
        [HttpGet("{managerId:int}")]
        public async Task<IActionResult> Get(int managerId)
        {
            var manager = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == managerId && u.Role == "Industry Manager");
            if (manager == null) return NotFound("Manager not found.");
            if (manager.AssignedIndustryId == null)
                return BadRequest("No industry assigned to this manager.");

            var industryId = manager.AssignedIndustryId.Value;

            var userIds = await _db.Users.AsNoTracking()
                .Where(u => u.AssignedIndustryId == industryId)
                .Select(u => u.Id)
                .ToListAsync();

            var r = await _db.EnvironmentalReadings.AsNoTracking()
                .Where(x => userIds.Contains(x.SubmittedByUserId))
                .OrderByDescending(x => x.SubmittedAt)
                .FirstOrDefaultAsync();

            if (r == null)
                return Ok(new { hasData = false, message = "No readings submitted yet for this industry." });

            var items = new List<Item>();

            items.Add(Upper("Air Quality (AQI)", r.AirQuality, 100, ""));

            // pH: safe range 6.5 to 8.5
            if (r.WaterPh < 6.5 || r.WaterPh > 8.5)
                items.Add(new("Water pH", r.WaterPh.ToString(), "High", $"{r.WaterPh} is outside the safe range 6.5 to 8.5"));
            else if (r.WaterPh < 6.8 || r.WaterPh > 8.2)
                items.Add(new("Water pH", r.WaterPh.ToString(), "Medium", $"{r.WaterPh} is close to the edge of the safe range 6.5 to 8.5"));
            else
                items.Add(new("Water pH", r.WaterPh.ToString(), "Low", $"{r.WaterPh} is within the safe range 6.5 to 8.5"));

            items.Add(Upper("Noise Level", r.NoiseLevel, 75, "dB"));
            items.Add(Upper("Temperature", r.Temperature, 40, "°C"));

            if (r.WasteDisposal == "Improper")
                items.Add(new("Waste Disposal", "Improper", "High", "Waste not disposed per standard"));
            else
                items.Add(new("Waste Disposal", "Proper", "Low", "Waste disposed per standard"));

            string overall = items.Any(i => i.Status == "High") ? "High"
                           : items.Any(i => i.Status == "Medium") ? "Medium" : "Low";

            return Ok(new
            {
                hasData = true,
                overall,
                highCount = items.Count(i => i.Status == "High"),
                mediumCount = items.Count(i => i.Status == "Medium"),
                lowCount = items.Count(i => i.Status == "Low"),
                readingTime = r.SubmittedAt,
                submittedBy = string.IsNullOrWhiteSpace(r.SubmittedByName) ? "Unknown" : r.SubmittedByName,
                items = items.Select(i => new { parameter = i.Parameter, value = i.Value, status = i.Status, reason = i.Reason })
            });
        }
    }
}