namespace EnviroSafe.API.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string SubmittedByName { get; set; } = string.Empty;
        public string SubmittedByRole { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public int? IndustryId { get; set; }

        // NEW
        public string Type { get; set; } = string.Empty;   // "IncidentReport", "Reading"
        public int? ReportId { get; set; }                 // link to the report
    }
}