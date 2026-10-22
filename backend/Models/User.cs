namespace EnviroSafe.API.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "Employee";

        // One user can be assigned to one industry
        public int? AssignedIndustryId { get; set; }

        // Navigation property
        public Industry? AssignedIndustry { get; set; }
    }
}