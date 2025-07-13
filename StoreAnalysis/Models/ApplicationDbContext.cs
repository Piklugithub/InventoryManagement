using Microsoft.EntityFrameworkCore;

namespace StoreAnalysis.Models
{
    public class ApplicationDbContext : DbContext // Ensure ApplicationDbContext inherits from DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) // Call the base constructor of DbContext
        {
        }

        public DbSet<Sale> Sales { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
    }
}
