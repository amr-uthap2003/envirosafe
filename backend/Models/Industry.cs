namespace EnviroSafe.API.Models
{
    public class Industry
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;

        public string Manager { get; set; } = "Unassigned";
        public string Status { get; set; } = "Active";
        public string ComplianceStatus { get; set; } = "Under Review";
        public string RiskLevel { get; set; } = "Medium";

        // Optional: link to an Industry Manager user later
        public int? ManagerId { get; set; }
    }
}