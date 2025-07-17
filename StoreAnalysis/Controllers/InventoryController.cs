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
        //[HttpGet]
        //public IActionResult GetProducts()
        //{
        //    var products = _context.Inventory.Select(p => new
        //    {
        //        p.Id,
        //        p.ProductName,
        //        p.Quantity
        //    }).ToList();

        //    return Json(products);
        //}
        [HttpGet]
        public IActionResult GetProducts()
        {
            var products = _context.Inventory
                .Select(p => new
                {
                    Id = p.Id,
                    ProductName = p.ProductName,
                    Quantity = p.Quantity,
                    MRP = p.MRP
                }).ToList();

            return Json(products);
        }
        //[HttpPost]
        //public IActionResult SellProduct([FromBody] SaleProduct model)
        //{
        //    var product = _context.Inventory.FirstOrDefault(p => p.Id == model.ProductId);
        //    if (product == null || product.Quantity < model.Quantity)
        //        return Json(new { success = false, message = "Invalid product or insufficient stock" });

        //    product.Quantity -= model.Quantity;
        //    model.SaleDate = DateTime.Today;
        //    _context.SaleProduct.Add(model);
        //    _context.SaveChanges();

        //    return Json(new { success = true });
        //}

        [HttpPost]
        public IActionResult SellProduct([FromBody] SaleProduct model)
        {
            if (model == null || model.ProductId <= 0 || model.Quantity <= 0)
                return Json(new { success = false, message = "Invalid data." });

            var product = _context.Inventory.FirstOrDefault(p => p.Id == model.ProductId);
            if (product == null)
                return Json(new { success = false, message = "Product not found." });

            if (product.Quantity < model.Quantity)
                return Json(new { success = false, message = "Not enough stock." });

            product.Quantity -= model.Quantity;

            // Optional: Log sale
            _context.SaleProduct.Add(new SaleProduct
            {
                ProductId = model.ProductId,
                Quantity = model.Quantity,
                SaleDate = DateTime.Now
            });

            _context.SaveChanges();
            return Json(new { success = true });
        }

        //[HttpPost]
        //public IActionResult AddStock([FromBody] StockAddition model)
        //{
        //    var product = _context.Inventory.FirstOrDefault(p => p.Id == model.ProductId);
        //    if (product == null)
        //        return Json(new { success = false, message = "Invalid product" });

        //    product.Quantity += model.Quantity;
        //    model.AddedDate = DateTime.Today;
        //    _context.StockAdditions.Add(model);
        //    _context.SaveChanges();

        //    return Json(new { success = true });
        //}

        [HttpPost]
        public IActionResult AddStock([FromBody] StockAddition model)
        {
            if (model == null || model.ProductId <= 0 || model.Quantity <= 0)
                return Json(new { success = false, message = "Invalid data." });

            var product = _context.Inventory.FirstOrDefault(p => p.Id == model.ProductId);
            if (product == null)
                return Json(new { success = false, message = "Product not found." });

            product.Quantity += model.Quantity;

            // Optional: Log addition
            _context.StockAdditions.Add(new StockAddition
            {
                ProductId = model.ProductId,
                Quantity = model.Quantity,
                AddedDate = DateTime.Now
            });

            _context.SaveChanges();
            return Json(new { success = true });
        }
    }
}
