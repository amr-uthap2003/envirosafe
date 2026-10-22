namespace EnviroSafe.API.Models
{
    public class CorrectiveAction
    {
        public int Id { get; set; }
        public int ReportId { get; set; }
        public int IndustryId { get; set; }
        public int CreatedByUserId { get; set; }
        public int? AssignedToUserId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // set when the action is for an employee reading (ReportId is 0 then)
        public int? ReadingId { get; set; }
    }
}