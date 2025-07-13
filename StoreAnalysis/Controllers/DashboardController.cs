using Microsoft.AspNetCore.Mvc;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult GetKPIData()
        {
            var today = DateTime.Today;

            var result = new
            {
                totalSales = _context.Sales.Where(s => s.Date == today).Sum(s => (decimal?)s.TotalAmount) ?? 0,
                totalProfit = _context.Sales.Where(s => s.Date == today).Sum(s => (decimal?)s.Profit) ?? 0,
                totalQuantitySold = _context.SaleItems.Where(i => i.Sale.Date == today).Sum(i => (int?)i.Quantity) ?? 0,
                newInventoryAdded = _context.Inventory.Where(i => i.AddedDate == today).Sum(i => (int?)i.Quantity) ?? 0
            };

            return Json(result);
        }

        [HttpGet]
        public IActionResult GetSalesChartData()
        {
            var today = DateTime.Today;
            var last7 = today.AddDays(-6);

            var rawSales = _context.Sales
                .Where(s => s.Date >= last7 && s.Date <= today)
                .ToList() // << force execution, so formatting below happens in-memory
                .GroupBy(s => s.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("MMM dd"), // now valid, done in memory
                    Total = g.Sum(x => x.TotalAmount)
                })
                .OrderBy(g => g.Date)
                .ToList();

            var sold = _context.SaleItems
                .Where(i => i.Sale.Date == today)
                .Sum(i => (int?)i.Quantity) ?? 0;

            var newInventory = _context.Inventory
                .Where(i => i.AddedDate == today)
                .Sum(i => (int?)i.Quantity) ?? 0;

            return Json(new
            {
                salesLabels = rawSales.Select(x => x.Date).ToList(),
                salesData = rawSales.Select(x => x.Total).ToList(),
                totalQuantitySold = sold,
                newInventoryAdded = newInventory
            });

        }
    }
}
