using EnviroSafe.API.Data;
using EnviroSafe.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;

namespace EnviroSafe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ============================================================
        // REGISTER
        // POST: api/users/register
        // ============================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Username == user.Username ||
                    u.Email == user.Email);

            if (existingUser != null)
            {
                var conflictField =
                    existingUser.Username == user.Username
                        ? "Username"
                        : "Email";

                return BadRequest(new
                {
                    message = $"{conflictField} already exists."
                });
            }

            if (string.IsNullOrWhiteSpace(user.Role))
            {
                user.Role = "Employee";
            }

            // New users are unassigned until Admin assigns an industry
            user.AssignedIndustryId = null;

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful.",
                user.Id,
                user.FullName,
                user.Username,
                user.Email,
                user.Role,
                user.AssignedIndustryId
            });
        }


        // ============================================================
        // NORMAL LOGIN
        // POST: api/users/login
        // ============================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.AssignedIndustry)
                .FirstOrDefaultAsync(u =>
                    u.Username == request.Username);

            if (user == null ||
                !BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.Password))
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            return Ok(new
            {
                message = "Login successful.",

                user.Id,
                user.FullName,
                user.Username,
                user.Email,
                user.PhoneNumber,
                user.Role,

                user.AssignedIndustryId,

                AssignedIndustryName =
                    user.AssignedIndustry != null
                        ? user.AssignedIndustry.Name
                        : null
            });
        }


        // ============================================================
        // GOOGLE LOGIN
        // POST: api/users/google-login
        // ============================================================
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin(
            [FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Credential))
            {
                return BadRequest(new
                {
                    message = "Google credential is required."
                });
            }

            try
            {
                // Get Google Client ID from appsettings.json
                var googleClientId =
                    _configuration["Google:ClientId"];

                if (string.IsNullOrWhiteSpace(googleClientId))
                {
                    return StatusCode(500, new
                    {
                        message =
                            "Google Client ID is not configured."
                    });
                }

                // Verify the Google ID token
                var payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        request.Credential,
                        new GoogleJsonWebSignature.ValidationSettings
                        {
                            Audience = new[]
                            {
                                googleClientId
                            }
                        });

                if (payload == null)
                {
                    return Unauthorized(new
                    {
                        message = "Invalid Google credential."
                    });
                }

                if (!payload.EmailVerified)
                {
                    return Unauthorized(new
                    {
                        message =
                            "Google email is not verified."
                    });
                }

                // Find existing user using Google email
                var user = await _context.Users
                    .Include(u => u.AssignedIndustry)
                    .FirstOrDefaultAsync(u =>
                        u.Email == payload.Email);

                // ====================================================
                // CREATE NEW USER IF GOOGLE EMAIL DOES NOT EXIST
                // ====================================================
                if (user == null)
                {
                    var baseUsername =
                        payload.Email.Split('@')[0];

                    var username = baseUsername;
                    var counter = 1;

                    // Make sure username is unique
                    while (await _context.Users
                        .AnyAsync(u => u.Username == username))
                    {
                        username =
                            $"{baseUsername}{counter}";
                        counter++;
                    }

                    user = new User
                    {
                        FullName =
                            string.IsNullOrWhiteSpace(payload.Name)
                                ? "Google User"
                                : payload.Name,

                        Username = username,

                        Email = payload.Email,

                        PhoneNumber = string.Empty,

                        // Google users don't use normal password login
                        Password =
                            BCrypt.Net.BCrypt.HashPassword(
                                Guid.NewGuid().ToString()),

                        Role = "Employee",

                        // Admin can assign industry later
                        AssignedIndustryId = null
                    };

                    _context.Users.Add(user);

                    await _context.SaveChangesAsync();

                    // Reload with industry navigation property
                    user = await _context.Users
                        .Include(u => u.AssignedIndustry)
                        .FirstAsync(u => u.Id == user.Id);
                }

                // ====================================================
                // GOOGLE LOGIN SUCCESS
                // ====================================================
                return Ok(new
                {
                    message = "Google login successful.",

                    user.Id,
                    user.FullName,
                    user.Username,
                    user.Email,
                    user.PhoneNumber,
                    user.Role,

                    user.AssignedIndustryId,

                    AssignedIndustryName =
                        user.AssignedIndustry != null
                            ? user.AssignedIndustry.Name
                            : null
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid Google credential."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message =
                        "Google login failed.",
                    error = ex.Message
                });
            }
        }


        // ============================================================
        // GET ALL USERS
        // GET: api/users
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.AssignedIndustry)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Username,
                    u.Email,
                    u.PhoneNumber,
                    u.Role,
                    u.AssignedIndustryId,

                    AssignedIndustryName =
                        u.AssignedIndustry != null
                            ? u.AssignedIndustry.Name
                            : null
                })
                .ToListAsync();

            return Ok(users);
        }


        // ============================================================
        // GET USER BY ID
        // GET: api/users/5
        // ============================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.AssignedIndustry)
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Username,
                    u.Email,
                    u.PhoneNumber,
                    u.Role,
                    u.AssignedIndustryId,

                    AssignedIndustryName =
                        u.AssignedIndustry != null
                            ? u.AssignedIndustry.Name
                            : null
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }


        // ============================================================
        // CHANGE USER ROLE
        // PUT: api/users/5/role
        // ============================================================
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(
            int id,
            [FromBody] RoleUpdateRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest(new
                {
                    message = "Role cannot be empty."
                });
            }

            // One Industry Manager per industry
            if (request.Role == "Industry Manager" &&
                user.AssignedIndustryId.HasValue)
            {
                var existingManager =
                    await _context.Users
                        .FirstOrDefaultAsync(u =>
                            u.Id != id &&
                            u.Role == "Industry Manager" &&
                            u.AssignedIndustryId ==
                            user.AssignedIndustryId.Value);

                if (existingManager != null)
                {
                    return BadRequest(new
                    {
                        message =
                            $"This industry already has an Industry Manager: {existingManager.FullName}."
                    });
                }
            }

            user.Role = request.Role;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User role updated successfully.",
                user.Id,
                user.FullName,
                user.Username,
                user.Role,
                user.AssignedIndustryId
            });
        }


        // ============================================================
        // ASSIGN INDUSTRY TO USER
        // PUT: api/users/5/industry
        // ============================================================
        [HttpPut("{id}/industry")]
        public async Task<IActionResult> AssignIndustry(
            int id,
            [FromBody] IndustryAssignRequest request)
        {
            var user = await _context.Users
                .Include(u => u.AssignedIndustry)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // Remove industry assignment
            if (!request.IndustryId.HasValue)
            {
                user.AssignedIndustryId = null;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message =
                        "Industry assignment removed successfully.",

                    user.Id,
                    user.FullName,
                    user.Role,

                    AssignedIndustryId = (int?)null,

                    AssignedIndustryName = (string?)null
                });
            }

            // Check industry exists
            var industry = await _context.Industries
                .FirstOrDefaultAsync(
                    i => i.Id == request.IndustryId.Value);

            if (industry == null)
            {
                return BadRequest(new
                {
                    message = "Invalid industry."
                });
            }

            // One Industry Manager per industry
            if (user.Role == "Industry Manager")
            {
                var existingManager =
                    await _context.Users
                        .FirstOrDefaultAsync(u =>
                            u.Id != id &&
                            u.Role == "Industry Manager" &&
                            u.AssignedIndustryId ==
                            request.IndustryId.Value);

                if (existingManager != null)
                {
                    return BadRequest(new
                    {
                        message =
                            $"This industry already has an Industry Manager: {existingManager.FullName}."
                    });
                }
            }

            // Assign industry
            user.AssignedIndustryId =
                request.IndustryId.Value;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Industry assignment updated successfully.",

                user.Id,
                user.FullName,
                user.Role,

                AssignedIndustryId =
                    user.AssignedIndustryId,

                AssignedIndustryName =
                    industry.Name
            });
        }


        // ============================================================
        // DELETE USER
        // DELETE: api/users/5
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User deleted successfully."
            });
        }
    }


    // ================================================================
    // LOGIN REQUEST
    // ================================================================
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }


    // ================================================================
    // GOOGLE LOGIN REQUEST
    // ================================================================
    public class GoogleLoginRequest
    {
        public string Credential { get; set; } = string.Empty;
    }


    // ================================================================
    // ROLE UPDATE REQUEST
    // ================================================================
    public class RoleUpdateRequest
    {
        public string Role { get; set; } = string.Empty;
    }


    // ================================================================
    // INDUSTRY ASSIGN REQUEST
    // ================================================================
    public class IndustryAssignRequest
    {
        public int? IndustryId { get; set; }
    }
}