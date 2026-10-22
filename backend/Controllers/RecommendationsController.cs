using EnviroSafe.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/recommendations")]
    public class RecommendationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public RecommendationsController(ApplicationDbContext db) => _db = db;

        // GET api/recommendations/for-user/{userId}
        // Employee  -> notes written on readings THEY submitted
        // Inspector -> notes written on reports THEY submitted
        [HttpGet("for-user/{userId:int}")]
        public async Task<IActionResult> GetForUser(int userId)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound("User not found.");

            if (user.Role == "Employee")
            {
                var list = await (
                    from m in _db.ManualRecommendations.AsNoTracking()
                    join r in _db.EnvironmentalReadings.AsNoTracking() on m.SourceId equals r.Id
                    where m.SourceType == "Employee" && r.SubmittedByUserId == userId
                    orderby m.CreatedAt descending
                    select new
                    {
                        m.Id,
                        m.Text,
                        m.CreatedByName,
                        m.CreatedAt,
                        kind = "Employee",
                        sourceDate = r.SubmittedAt,
                        r.AirQuality,
                        r.WaterPh,
                        r.NoiseLevel,
                        r.Temperature,
                        r.WasteDisposal,
                        ComplianceStatus = (string?)null,
                        RiskLevel = (string?)null
                    }).ToListAsync();

                return Ok(list);
            }

            if (user.Role == "Inspector")
            {
                var list = await (
                    from m in _db.ManualRecommendations.AsNoTracking()
                    join r in _db.Reports.AsNoTracking() on m.SourceId equals r.Id
                    where m.SourceType == "Inspector" && r.SubmittedByUserId == userId
                    orderby m.CreatedAt descending
                    select new
                    {
                        m.Id,
                        m.Text,
                        m.CreatedByName,
                        m.CreatedAt,
                        kind = "Inspector",
                        sourceDate = r.ReportDate,
                        AirQuality = (double?)null,
                        WaterPh = (double?)null,
                        NoiseLevel = (double?)null,
                        Temperature = (double?)null,
                        WasteDisposal = (string?)null,
                        r.ComplianceStatus,
                        r.RiskLevel
                    }).ToListAsync();

                return Ok(list);
            }

            return BadRequest("Only employees and inspectors receive recommendations.");
        }
    }
}
