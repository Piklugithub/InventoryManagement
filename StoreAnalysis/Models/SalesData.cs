using System.ComponentModel.DataAnnotations;

namespace StoreAnalysis.Models
{
    public class SalesData
    {
        [Key]
        public int SalesID { get; set; }
        public string StoreName { get; set; }
        public string ProductName { get; set; }
        public DateTime SaleDate { get; set; }
        public int Quantity { get; set; }
        public decimal Amount { get; set; }
    }
}
