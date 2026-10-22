namespace EnviroSafe.API.Models
{
    public class CreateReadingDto
    {
        public int UserId { get; set; }
        public double AirQuality { get; set; }
        public double WaterPh { get; set; }
        public double NoiseLevel { get; set; }
        public double Temperature { get; set; }
        public string WasteDisposal { get; set; } = "Proper";
        public string? Notes { get; set; }
    }
}