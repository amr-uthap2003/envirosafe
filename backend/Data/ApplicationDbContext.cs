using Microsoft.EntityFrameworkCore;
using EnviroSafe.API.Models;

namespace EnviroSafe.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        

        public DbSet<User> Users { get; set; }
        public DbSet<Industry> Industries { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<EnvironmentalReading> EnvironmentalReadings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ManualRecommendation> ManualRecommendations { get; set; }
        public DbSet<CorrectiveAction> CorrectiveActions { get; set; }
    }
}