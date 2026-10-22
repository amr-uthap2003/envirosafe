using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IndustriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public IndustriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // GET ALL INDUSTRIES
        // GET: api/industries
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> GetAllIndustries()
        {
            var industries = await _context.Industries.ToListAsync();
            return Ok(industries);
        }

        // ============================================================
        // GET INDUSTRY BY ID
        // GET: api/industries/5
        // ============================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetIndustry(int id)
        {
            var industry = await _context.Industries.FindAsync(id);

            if (industry == null)
            {
                return NotFound(new { message = "Industry not found." });
            }

            return Ok(industry);
        }

        // ============================================================
        // ADD INDUSTRY
        // POST: api/industries
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> AddIndustry([FromBody] Industry industry)
        {
            _context.Industries.Add(industry);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Industry added successfully.",
                industry.Id,
                industry.Name,
                industry.Location,
                industry.Type,
                industry.Manager,
                industry.Status,
                industry.ComplianceStatus,
                industry.RiskLevel
            });
        }

        // ============================================================
        // UPDATE INDUSTRY
        // PUT: api/industries/5
        // ============================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIndustry(int id, [FromBody] Industry industry)
        {
            var existingIndustry = await _context.Industries.FindAsync(id);

            if (existingIndustry == null)
            {
                return NotFound(new { message = "Industry not found." });
            }

            existingIndustry.Name = industry.Name;
            existingIndustry.Type = industry.Type;
            existingIndustry.Location = industry.Location;
            existingIndustry.Manager = industry.Manager;
            existingIndustry.Status = industry.Status;
            existingIndustry.ComplianceStatus = industry.ComplianceStatus;
            existingIndustry.RiskLevel = industry.RiskLevel;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Industry updated successfully.",
                existingIndustry.Id,
                existingIndustry.Name,
                existingIndustry.Location,
                existingIndustry.Type,
                existingIndustry.Manager,
                existingIndustry.Status,
                existingIndustry.ComplianceStatus,
                existingIndustry.RiskLevel
            });
        }

        // ============================================================
        // DELETE INDUSTRY
        // DELETE: api/industries/5
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIndustry(int id)
        {
            var industry = await _context.Industries.FindAsync(id);

            if (industry == null)
            {
                return NotFound(new { message = "Industry not found." });
            }

            _context.Industries.Remove(industry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Industry deleted successfully." });
        }
    }
}