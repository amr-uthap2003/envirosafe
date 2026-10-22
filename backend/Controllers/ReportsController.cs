using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/reports
        [HttpGet]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _context.Reports
                .Include(r => r.Industry)
                .OrderByDescending(r => r.ReportDate)
                .ToListAsync();

            return Ok(reports);
        }

        // GET: api/reports/industry/5
        [HttpGet("industry/{industryId}")]
        public async Task<IActionResult> GetReportsForIndustry(int industryId)
        {
            var reports = await _context.Reports
                .Where(r => r.IndustryId == industryId)
                .Include(r => r.Industry)
                .OrderByDescending(r => r.ReportDate)
                .ToListAsync();

            return Ok(reports);
        }

        // GET: api/reports/manager/7
        [HttpGet("manager/{managerId}")]
        public async Task<IActionResult> GetReportsForManager(int managerId)
        {
            var industryId = await _context.Users
                .Where(u => u.Id == managerId)
                .Select(u => u.AssignedIndustryId)
                .FirstOrDefaultAsync();

            if (industryId == null)
                return Ok(new List<Report>());

            var reports = await _context.Reports
                .Where(r => r.IndustryId == industryId)
                .Include(r => r.Industry)
                .OrderByDescending(r => r.ReportDate)
                .ToListAsync();

            return Ok(reports);
        }

        // GET: api/reports/manager/7/all
        // Reports of the manager's industry from BOTH inspectors and employees,
        // with the submitter's role included
        [HttpGet("manager/{managerId}/all")]
        public async Task<IActionResult> GetAllReportsForManager(int managerId)
        {
            var industryId = await _context.Users
                .Where(u => u.Id == managerId)
                .Select(u => u.AssignedIndustryId)
                .FirstOrDefaultAsync();

            if (industryId == null)
                return Ok(new List<object>());

            var reports = await (
                from r in _context.Reports
                where r.IndustryId == industryId
                join u in _context.Users on r.SubmittedByUserId equals u.Id into gj
                from u in gj.DefaultIfEmpty()
                orderby r.ReportDate descending
                select new
                {
                    r.Id,
                    r.IndustryId,
                    IndustryName = r.Industry!.Name,
                    r.ReportType,
                    r.Description,
                    r.ReportDate,
                    r.RiskLevel,
                    r.ActiveViolations,
                    r.ComplianceStatus,
                    r.SubmittedByUserId,
                    r.SubmittedByName,
                    SubmittedByRole = u != null ? u.Role : ""
                }
            ).ToListAsync();

            return Ok(reports);
        }

        // GET: api/reports/manager/7/inspectors
        [HttpGet("manager/{managerId}/inspectors")]
        public async Task<IActionResult> GetInspectorsForManager(int managerId)
        {
            var industryId = await _context.Users
                .Where(u => u.Id == managerId)
                .Select(u => u.AssignedIndustryId)
                .FirstOrDefaultAsync();

            if (industryId == null)
                return Ok(new List<object>());

            var inspectors = await _context.Users
                .Where(u => u.Role == "Inspector" && u.AssignedIndustryId == industryId)
                .Select(u => new { u.Id, u.FullName, u.Email, u.PhoneNumber })
                .ToListAsync();

            return Ok(inspectors);
        }

        // POST: api/reports
        // Uses the industry chosen on the page, otherwise the user's assigned industry
        [HttpPost]
        public async Task<IActionResult> SubmitReport([FromBody] SubmitReportDto dto)
        {
            // Works with both the new field (inspectorId) and the old one (submittedByUserId)
            var submitterId = dto.InspectorId != 0 ? dto.InspectorId : dto.SubmittedByUserId;

            var submitter = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == submitterId &&
                                          (u.Role == "Inspector" || u.Role == "Employee"));

            if (submitter == null)
                return NotFound(new { message = "User not found." });

            var industryId = dto.IndustryId ?? submitter.AssignedIndustryId;

            if (industryId == null)
                return BadRequest(new { message = "No industry selected or assigned." });

            var industry = await _context.Industries.FindAsync(industryId.Value);
            if (industry == null)
                return NotFound(new { message = "Industry not found." });

            var report = new Report
            {
                IndustryId = industry.Id,
                ReportType = dto.ReportType,
                Description = dto.Description,
                RiskLevel = dto.RiskLevel,
                ActiveViolations = dto.ActiveViolations,
                ComplianceStatus = dto.ComplianceStatus,
                ReportDate = DateTime.UtcNow,
                SubmittedByUserId = submitter.Id,
                SubmittedByName = submitter.FullName
            };

            // 1) Save the report first so report.Id has a value
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            // 2) Create the notification linked to that report
            _context.Notifications.Add(new Notification
            {
                Message = $"New {report.ReportType} submitted for {industry.Name} " +
                          $"(Risk: {report.RiskLevel}, Violations: {report.ActiveViolations})",
                SubmittedByName = submitter.FullName,
                SubmittedByRole = submitter.Role,
                IndustryId = industry.Id,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                Type = "IncidentReport",   // NEW
                ReportId = report.Id       // NEW
            });
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Report submitted successfully.",
                report.Id,
                report.IndustryId,
                report.ReportType,
                report.Description,
                report.ReportDate,
                report.RiskLevel,
                report.ActiveViolations,
                report.ComplianceStatus,
                report.SubmittedByName
            });
        }
    }

    public class SubmitReportDto
    {
        public int InspectorId { get; set; }           // new clients
        public int SubmittedByUserId { get; set; }     // your existing page sends this
        public int? IndustryId { get; set; }           // industry chosen in the dropdown
        public string ReportType { get; set; } = "Inspection Report";
        public string Description { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = "Low";
        public int ActiveViolations { get; set; } = 0;
        public string ComplianceStatus { get; set; } = "Under Review";
    }
}