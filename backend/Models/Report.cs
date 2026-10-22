namespace EnviroSafe.API.Models
{
    public class Report
    {
        public int Id { get; set; }

        public int IndustryId { get; set; }
        public Industry? Industry { get; set; }

        public string ReportType { get; set; } = "Inspection Report"; // e.g. Incident Report, Quarterly Report
        public string Description { get; set; } = string.Empty;

        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        public string RiskLevel { get; set; } = "Low";           // Low / Medium / High
        public int ActiveViolations { get; set; } = 0;
        public string ComplianceStatus { get; set; } = "Under Review"; // Compliant / Non-Compliant / Under Review

        public int SubmittedByUserId { get; set; }   // Inspector's user id
        public string SubmittedByName { get; set; } = string.Empty; // Inspector's name, saved directly for easy display
    }
}