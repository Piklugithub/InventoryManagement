using Microsoft.EntityFrameworkCore;

namespace StoreAnalysis.Models
{
    public class ApplicationDbContext : DbContext // Ensure ApplicationDbContext inherits from DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) // Call the base constructor of DbContext
        {
        }

        public DbSet<SalesData> Sales { get; set; }
        public DbSet<Users> Users { get; set; }
    }
}
