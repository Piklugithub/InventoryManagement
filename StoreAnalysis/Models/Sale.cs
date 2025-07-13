namespace StoreAnalysis.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Profit { get; set; }

        public ICollection<SaleItem> Items { get; set; }
    }
}
