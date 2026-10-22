using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ReadingsController : ControllerBase
{
    private static SensorReading? _latest;
    private static readonly List<SensorReading> _history = new();
    private static readonly object _lock = new();

    // ESP32 sends data here
    [HttpPost]
    public IActionResult Post([FromBody] SensorReading reading)
    {
        reading.Timestamp = DateTime.UtcNow;
        lock (_lock)
        {
            _latest = reading;
            _history.Add(reading);
            if (_history.Count > 100) _history.RemoveAt(0);
        }
        return Ok();
    }

    // Frontend reads the newest values here
    [HttpGet("latest")]
    public IActionResult GetLatest()
    {
        lock (_lock)
        {
            if (_latest == null) return NoContent();
            return Ok(_latest);
        }
    }

    // Frontend reads recent history here (for charts)
    [HttpGet("history")]
    public IActionResult GetHistory()
    {
        lock (_lock)
        {
            return Ok(_history.ToList());
        }
    }
}

public class SensorReading
{
    public float Temperature { get; set; }
    public float Humidity { get; set; }
    public int AirQuality { get; set; }
    public int CarbonMonoxide { get; set; }
    public DateTime Timestamp { get; set; }
}