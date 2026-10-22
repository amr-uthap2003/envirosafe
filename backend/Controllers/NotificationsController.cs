using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/notifications  (all, for admin)
        [HttpGet]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notifications = await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/notifications/industry/2007  (for the industry's manager)
        [HttpGet("industry/{industryId}")]
        public async Task<IActionResult> GetNotificationsForIndustry(int industryId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.IndustryId == industryId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/notifications/unread-count/2007   (NEW, for the sidebar badge)
        [HttpGet("unread-count/{industryId}")]
        public async Task<IActionResult> GetUnreadCount(int industryId)
        {
            var count = await _context.Notifications
                .CountAsync(n => n.IndustryId == industryId && !n.IsRead);

            return Ok(count);
        }

        // PUT: api/notifications/5/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound(new { message = "Notification not found." });

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read." });
        }

        // PUT: api/notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var unread = await _context.Notifications.Where(n => !n.IsRead).ToListAsync();
            foreach (var n in unread) n.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "All notifications marked as read." });
        }

        // PUT: api/notifications/industry/2007/read-all
        [HttpPut("industry/{industryId}/read-all")]
        public async Task<IActionResult> MarkAllAsReadForIndustry(int industryId)
        {
            var unread = await _context.Notifications
                .Where(n => n.IndustryId == industryId && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread) n.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "All notifications marked as read." });
        }
    }
}