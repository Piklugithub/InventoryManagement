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
            var sales = _context.Sales.ToList();

            var result = new KPIResult
            {
                TotalSales = sales.Sum(s => s.Amount),
                TotalOrders = sales.Count,
                TopStore = sales.GroupBy(s => s.StoreName)
                                .OrderByDescending(g => g.Sum(x => x.Amount))
                                .FirstOrDefault()?.Key ?? "N/A",
                AvgOrderValue = sales.Any() ? sales.Average(s => s.Amount) : 0
            };

            return Json(result);
        }

        [HttpGet]
        public IActionResult GetSalesChartData()
        {
                var result = _context.Sales
           .GroupBy(x => x.SaleDate.Date)
           .Select(g => new
           {
               Date = g.Key, // Keep as DateTime for now
               Total = g.Sum(x => x.Amount)
           })
           .AsEnumerable() // Switch to client-side evaluation
           .Select(g => new
           {
               Date = g.Date.ToString("yyyy-MM-dd"), // Format on the client side
               Total = g.Total
           })
           .OrderBy(x => x.Date)
           .ToList();

                return Json(result);

        }
    }
}
