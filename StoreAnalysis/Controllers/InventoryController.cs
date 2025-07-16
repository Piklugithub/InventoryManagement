using Microsoft.AspNetCore.Mvc;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class InventoryController : Controller
    {
        private readonly ApplicationDbContext _context;

        public InventoryController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult GetProducts()
        {
            var products = _context.Inventory.Select(p => new
            {
                p.Id,
                p.ProductName,
                p.Quantity
            }).ToList();

            return Json(products);
        }

        [HttpPost]
        public IActionResult SellProduct([FromBody] SaleProduct model)
        {
            var product = _context.Inventory.FirstOrDefault(p => p.Id == model.ProductId);
            if (product == null || product.Quantity < model.Quantity)
                return Json(new { success = false, message = "Invalid product or insufficient stock" });

            product.Quantity -= model.Quantity;
            model.SaleDate = DateTime.Today;
            _context.SaleProduct.Add(model);
            _context.SaveChanges();

            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult AddStock([FromBody] StockAddition model)
        {
            var product = _context.Inventory.FirstOrDefault(p => p.Id == model.ProductId);
            if (product == null)
                return Json(new { success = false, message = "Invalid product" });

            product.Quantity += model.Quantity;
            model.AddedDate = DateTime.Today;
            _context.StockAdditions.Add(model);
            _context.SaveChanges();

            return Json(new { success = true });
        }
    }
}
