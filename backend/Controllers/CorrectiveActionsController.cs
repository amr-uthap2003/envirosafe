using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CorrectiveActionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CorrectiveActionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/correctiveactions/industry/5
        [HttpGet("industry/{industryId}")]
        public async Task<IActionResult> GetByIndustry(int industryId)
        {
            var items = await _context.CorrectiveActions
                .Where(c => c.IndustryId == industryId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(items);
        }

        // POST api/correctiveactions
        [HttpPost]
        public async Task<IActionResult> Create(CorrectiveAction model)
        {
            _context.CorrectiveActions.Add(model);

            // mark the incident notification for this report as read
            var notifs = await _context.Notifications
                .Where(n => n.ReportId == model.ReportId
                         && n.IndustryId == model.IndustryId
                         && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifs)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok(model);
        }

        // PUT api/correctiveactions/3/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var item = await _context.CorrectiveActions.FindAsync(id);
            if (item == null) return NotFound();

            item.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}