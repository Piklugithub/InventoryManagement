namespace StoreAnalysis.Models
{
    public class KPIResult
    {
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public string TopStore { get; set; }
        public decimal AvgOrderValue { get; set; }
    }
}
