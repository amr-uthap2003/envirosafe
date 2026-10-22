namespace EnviroSafe.API.Models
{
    public class ManualRecommendation
    {
        public int Id { get; set; }

        public int IndustryId { get; set; }

        public string SourceType { get; set; } = string.Empty;   // "Employee" or "Inspector"
        public int SourceId { get; set; }                        // EnvironmentalReading.Id or Report.Id

        public string Text { get; set; } = string.Empty;

        public int CreatedByUserId { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}