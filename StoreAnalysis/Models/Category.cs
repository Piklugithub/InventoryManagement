using System.Drawing.Drawing2D;

namespace StoreAnalysis.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        public ICollection<Brand> Brands { get; set; }
        public ICollection<Inventory> Inventories { get; set; }
    }
}
