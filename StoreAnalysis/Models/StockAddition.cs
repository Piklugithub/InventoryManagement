namespace StoreAnalysis.Models
{
    public class StockAddition
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public int? Quantity { get; set; }
        public DateTime AddedDate { get; set; }

        public Inventory? Product { get; set; }
    }
}
