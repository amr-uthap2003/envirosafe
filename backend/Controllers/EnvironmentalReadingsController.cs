using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EnviroSafe.API.Data;
using EnviroSafe.API.Models;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnvironmentalReadingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnvironmentalReadingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/environmentalreadings
        [HttpPost]
        public async Task<ActionResult<EnvironmentalReading>> Create(CreateReadingDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return BadRequest("Invalid user.");

            var reading = new EnvironmentalReading
            {
                AirQuality = dto.AirQuality,
                WaterPh = dto.WaterPh,
                NoiseLevel = dto.NoiseLevel,
                Temperature = dto.Temperature,
                WasteDisposal = dto.WasteDisposal,
                Notes = dto.Notes ?? string.Empty,
                SubmittedAt = DateTime.UtcNow,
                SubmittedByUserId = user.Id,
                SubmittedByName = user.FullName,
                SubmittedByRole = user.Role
            };

            _context.EnvironmentalReadings.Add(reading);
            await _context.SaveChangesAsync();

            // ---- Creates a persisted notification for the admin dashboard ----
            _context.Notifications.Add(new Notification
            {
                Message = $"New reading submitted by {user.FullName}",
                SubmittedByName = user.FullName,
                SubmittedByRole = user.Role,
                IndustryId = user.AssignedIndustryId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });
            await _context.SaveChangesAsync();

            return Ok(reading);
        }

        // GET: api/environmentalreadings?userId=5   -> that user's readings
        // GET: api/environmentalreadings             -> all readings (used by admin dashboard polling)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnvironmentalReading>>> GetByUser([FromQuery] int? userId)
        {
            var query = _context.EnvironmentalReadings.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(r => r.SubmittedByUserId == userId.Value);
            }

            var readings = await query
                .OrderByDescending(r => r.SubmittedAt)
                .ToListAsync();

            return Ok(readings);
        }
    }
}