namespace EnviroSafe.API.Models
{
    public class EnvironmentalReading
    {
        public int Id { get; set; }

        public double AirQuality { get; set; }
        public double WaterPh { get; set; }
        public double NoiseLevel { get; set; }
        public double Temperature { get; set; }

        public string WasteDisposal { get; set; } = "Proper"; // Proper / Improper
        public string Notes { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public int SubmittedByUserId { get; set; }
        public string SubmittedByName { get; set; } = string.Empty; // saved directly, same pattern as Report.SubmittedByName
        public string SubmittedByRole { get; set; } = string.Empty; // NEW — same pattern as SubmittedByName
    }
}