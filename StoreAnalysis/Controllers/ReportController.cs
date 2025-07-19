using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using OfficeOpenXml;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class ReportController : Controller
    {

        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult GetFilterDropdowns()
        {
            var categories = _context.Categories
                .Select(c => new { categoryId = c.Id, categoryName = c.Name })
                .ToList();

            var brands = _context.Brands
                .Select(b => new { brandId = b.Id, brandName = b.Name })
                .ToList();

            return Json(new { categories, brands });
        }

        [HttpGet]
        public async Task<IActionResult> GetReportData(DateTime? fromDate, DateTime? toDate, int? brandId, int? categoryId)
        {
            var salesQuery = _context.SaleProduct
                .Include(s => s.Product)
                .ThenInclude(p => p.Brand)
                .Include(s => s.Product.Category)
                .Where(s => s.SaleDate != null);

            var inventoryQuery = _context.StockAdditions
                .Include(sa => sa.Product)
                .ThenInclude(p => p.Brand)
                .Include(sa => sa.Product.Category)
                .Where(s => s.AddedDate != null);

            if (fromDate.HasValue && toDate.HasValue)
            {
                salesQuery = salesQuery.Where(s => s.SaleDate >= fromDate && s.SaleDate <= toDate);
                inventoryQuery = inventoryQuery.Where(i => i.AddedDate >= fromDate && i.AddedDate <= toDate);
            }

            if (brandId.HasValue)
            {
                salesQuery = salesQuery.Where(s => s.Product.BrandId == brandId);
                inventoryQuery = inventoryQuery.Where(i => i.Product.BrandId == brandId);
            }

            if (categoryId.HasValue)
            {
                salesQuery = salesQuery.Where(s => s.Product.CategoryId == categoryId);
                inventoryQuery = inventoryQuery.Where(i => i.Product.CategoryId == categoryId);
            }

            var salesData = await salesQuery
                .Select(s => new
                {
                    s.Product.ProductName,
                    Brand = s.Product.Brand.Name,
                    Category = s.Product.Category.Name,
                    Quantity = s.Quantity ?? 0,
                    TotalSale = s.TotalAmount ?? 0,
                    Profit = (s.TotalAmount ?? 0) * 0.10m,
                    SaleDate = s.SaleDate.Value.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            var inventoryData = await inventoryQuery
                .Select(i => new
                {
                    i.Product.ProductName,
                    Brand = i.Product.Brand.Name,
                    Category = i.Product.Category.Name,
                    QuantityAdded = i.Quantity,
                    Date = i.AddedDate.ToString("yyyy-MM-dd")?? ""
                })
                .ToListAsync();

            var bestSelling = await salesQuery
                .GroupBy(s => new { s.ProductId, s.Product.ProductName, s.Product.Brand.Name })
                .Select(g => new
                {
                    g.Key.ProductName,
                    Brand = g.Key.Name,
                    Category = g.Key.Name,
                    TotalSold = g.Sum(x => x.Quantity) ?? 0,
                    TotalSale = g.Sum(x => x.TotalAmount) ?? 0,
                    Profit = g.Sum(x => x.TotalAmount) * 0.10m ?? 0
                })
                .OrderByDescending(x => x.TotalSold)
                .Take(10)
                .ToListAsync();

            return Json(new { salesData, inventoryData, bestSelling });
        }
        [HttpGet]
        public IActionResult ExportToExcel(DateTime? fromDate, DateTime? toDate, int? brandId, int? categoryId)
        {
            var salesData = _context.SaleProduct
                .Include(s => s.Product)
                    .ThenInclude(p => p.Brand)
                .Include(s => s.Product)
                    .ThenInclude(p => p.Category)
                .AsQueryable();

            if (fromDate.HasValue && toDate.HasValue)
                salesData = salesData.Where(s => s.SaleDate >= fromDate && s.SaleDate <= toDate);

            if (brandId.HasValue)
                salesData = salesData.Where(s => s.Product.BrandId == brandId);

            if (categoryId.HasValue)
                salesData = salesData.Where(s => s.Product.CategoryId == categoryId);

            var data = salesData.Select(s => new
            {
                ProductName = s.Product.ProductName,
                Brand = s.Product.Brand.Name,
                Category = s.Product.Category.Name,
                Quantity = s.Quantity,
                TotalSale = s.Quantity * s.Product.MRP,
                Profit = s.Quantity * s.Product.MRP * 0.10m,
                SaleDate = s.SaleDate.Value.ToString("yyyy-MM-dd")
            }).ToList();

            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Sales Report");

            ws.Cells[1, 1].Value = "Product";
            ws.Cells[1, 2].Value = "Brand";
            ws.Cells[1, 3].Value = "Category";
            ws.Cells[1, 4].Value = "Quantity";
            ws.Cells[1, 5].Value = "Total Sale";
            ws.Cells[1, 6].Value = "Profit";
            ws.Cells[1, 7].Value = "Sale Date";

            for (int i = 0; i < data.Count; i++)
            {
                var item = data[i];
                ws.Cells[i + 2, 1].Value = item.ProductName;
                ws.Cells[i + 2, 2].Value = item.Brand;
                ws.Cells[i + 2, 3].Value = item.Category;
                ws.Cells[i + 2, 4].Value = item.Quantity;
                ws.Cells[i + 2, 5].Value = item.TotalSale;
                ws.Cells[i + 2, 6].Value = item.Profit;
                ws.Cells[i + 2, 7].Value = item.SaleDate;
            }

            ws.Cells[ws.Dimension.Address].AutoFitColumns();

            var stream = new MemoryStream(package.GetAsByteArray());
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SalesReport.xlsx");
        }
    }

}
