using System.ComponentModel.DataAnnotations;

namespace StoreAnalysis.Models
{
    public class Brand
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }

        public int CategoryId { get; set; }
        //public Category Category { get; set; }
    }
}
