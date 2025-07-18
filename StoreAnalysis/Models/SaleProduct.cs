namespace StoreAnalysis.Models
{
    public class SaleProduct
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int? Quantity { get; set; }
        public decimal? TotalAmount { get; set; }
        public DateTime? SaleDate { get; set; }

        public Inventory? Product { get; set; }
    }
}
