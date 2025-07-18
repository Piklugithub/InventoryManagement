using System.ComponentModel.DataAnnotations;

namespace StoreAnalysis.Models
{
    public class Supplier
    {
        public int SupplierId { get; set; }
        [Required]
        public string SupplierName { get; set; }
        public string ContactPerson { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDelete { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
