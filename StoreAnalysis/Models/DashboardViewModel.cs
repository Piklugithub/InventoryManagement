namespace StoreAnalysis.Models
{
    public class DashboardViewModel
    {
        public decimal TotalSales { get; set; }
        public decimal TotalProfit { get; set; }
        public int TotalQuantitySold { get; set; }
        public int NewInventoryAdded { get; set; }

        public List<string> SalesChartLabels { get; set; }
        public List<decimal> SalesChartData { get; set; }
    }
}
