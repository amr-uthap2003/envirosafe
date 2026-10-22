using EnviroSafe.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/my-corrective")]
    public class MyCorrectiveController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public MyCorrectiveController(ApplicationDbContext db) => _db = db;

        private sealed record Item(string Parameter, string Value, string Status, string Reason);

        // same rule as the manager's Risk Prediction page
        private static Item Upper(string name, double v, double limit, string unit)
        {
            string u = unit == "" ? "" : " " + unit;
            if (v > limit) return new(name, $"{v}{u}", "High", $"{v} exceeds the limit of {limit}{u}");
            if (v >= 0.9 * limit) return new(name, $"{v}{u}", "Medium", $"{v} is within 10% of the limit of {limit}{u}");
            return new(name, $"{v}{u}", "Low", $"{v} is well within the limit of {limit}{u}");
        }

        // GET api/my-corrective/{userId}
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> Get(int userId)
        {
            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId && (u.Role == "Employee" || u.Role == "Inspector"));
            if (user == null) return NotFound("User not found.");

            var ids = new HashSet<int>();
            if (user.AssignedIndustryId != null) ids.Add(user.AssignedIndustryId.Value);

            if (user.Role == "Inspector")
            {
                var inspected = await _db.Reports.AsNoTracking()
                    .Where(r => r.SubmittedByUserId == userId)
                    .Select(r => r.IndustryId)
                    .Distinct()
                    .ToListAsync();
                foreach (var i in inspected) ids.Add(i);
            }

            if (ids.Count == 0)
                return Ok(new { hasData = false, message = "No industry is linked to your account yet." });

            var industries = new List<object>();

            foreach (var industryId in ids)
            {
                var industry = await _db.Industries.AsNoTracking()
                    .Where(i => i.Id == industryId)
                    .Select(i => new { i.Name, i.Type })
                    .FirstOrDefaultAsync();

                var actions = await _db.CorrectiveActions.AsNoTracking()
                    .Where(c => c.IndustryId == industryId)
                    .OrderBy(c => c.DueDate)
                    .ToListAsync();

                var reportIds = actions.Select(a => a.ReportId).Distinct().ToList();
                var reportMap = await _db.Reports.AsNoTracking()
                    .Where(r => reportIds.Contains(r.Id))
                    .ToDictionaryAsync(r => r.Id, r => r.ReportType + " (" + r.ComplianceStatus + ")");

                // latest reading from this industry's employees
                var staffIds = await _db.Users.AsNoTracking()
                    .Where(u => u.AssignedIndustryId == industryId)
                    .Select(u => u.Id)
                    .ToListAsync();

                var r = await _db.EnvironmentalReadings.AsNoTracking()
                    .Where(x => staffIds.Contains(x.SubmittedByUserId))
                    .OrderByDescending(x => x.SubmittedAt)
                    .FirstOrDefaultAsync();

                string? overall = null;
                var items = new List<Item>();

                if (r != null)
                {
                    items.Add(Upper("Air Quality (AQI)", r.AirQuality, 100, ""));

                    if (r.WaterPh < 6.5 || r.WaterPh > 8.5)
                        items.Add(new("Water pH", r.WaterPh.ToString(), "High", $"{r.WaterPh} is outside the safe range 6.5 to 8.5"));
                    else if (r.WaterPh < 6.8 || r.WaterPh > 8.2)
                        items.Add(new("Water pH", r.WaterPh.ToString(), "Medium", $"{r.WaterPh} is close to the edge of the safe range"));
                    else
                        items.Add(new("Water pH", r.WaterPh.ToString(), "Low", $"{r.WaterPh} is within the safe range"));

                    items.Add(Upper("Noise Level", r.NoiseLevel, 75, "dB"));
                    items.Add(Upper("Temperature", r.Temperature, 40, "°C"));

                    items.Add(r.WasteDisposal == "Improper"
                        ? new Item("Waste Disposal", "Improper", "High", "Waste not disposed per standard")
                        : new Item("Waste Disposal", "Proper", "Low", "Waste disposed per standard"));

                    overall = items.Any(i => i.Status == "High") ? "High"
                            : items.Any(i => i.Status == "Medium") ? "Medium" : "Low";
                }

                industries.Add(new
                {
                    industryId,
                    industryName = industry?.Name,
                    industryType = industry?.Type,
                    overall,
                    readingTime = r?.SubmittedAt,
                    items = items.Select(i => new { parameter = i.Parameter, value = i.Value, status = i.Status, reason = i.Reason }),
                    actions = actions.Select(a => new
                    {
                        id = a.Id,
                        description = a.Description,
                        report = reportMap.TryGetValue(a.ReportId, out var lbl) ? lbl : "#" + a.ReportId,
                        dueDate = a.DueDate,
                        status = a.Status
                    })
                });
            }

            return Ok(new { hasData = true, role = user.Role, industries });
        }
    }
}