using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class ProductController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult GetDropdownData()
        {
            var categories = _context.Categories.Select(c => new SelectListItem
            {
                Value = c.Id.ToString(),
                Text = c.Name
            }).ToList();

            var brands = _context.Brands.Where(b => b.IsActive).Select(b => new SelectListItem
            {
                Value = b.Id.ToString(),
                Text = b.Name
            }).ToList();
            var supplier = _context.Suppliers.Where(b => b.IsActive).Select(b => new SelectListItem
            {
                Value = b.SupplierId.ToString(),
                Text = b.SupplierName
            }).ToList();

            return Json(new { categories, brands, supplier });
        }
        [HttpGet]
        public IActionResult GetAllProducts()
        {
            var products = _context.Inventory
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .Select(p => new
                {
                    p.Id,
                    productName = p.ProductName,
                    p.Quantity,
                    p.MRP,
                    categoryName = p.Category != null ? p.Category.Name : "",
                    brandName = p.Brand != null ? p.Brand.Name : "",
                    supplierName = p.Supplier != null ? p.Supplier.SupplierName : ""
                }).ToList();

            return Json(products);
        }
        [HttpPost]
        public IActionResult AddProduct([FromBody] Inventory model)
        {
            if (!ModelState.IsValid)
            {
                model.AddedDate = DateTime.Today;
                _context.Inventory.Add(model);
                _context.SaveChanges();
                return Json(new { success = true });
            }

            return Json(new { success = false, message = "Invalid data" });
        }
        [HttpPost]
        public IActionResult UpdateProductInline([FromBody] Inventory updated)
        {
            var product = _context.Inventory.FirstOrDefault(p => p.Id == updated.Id);
            if (product == null)
                return Json(new { success = false, message = "Product not found." });

            product.ProductName = updated.ProductName;
            product.MRP = updated.MRP;
            product.Quantity = updated.Quantity;

            _context.SaveChanges();
            return Json(new { success = true });
        }
        [HttpPost]
        public IActionResult Delete(int id)
        {
            var item = _context.Inventory.Find(id);
            if (item != null)
            {
                _context.Inventory.Remove(item);
                _context.SaveChanges();
                return Json(new { success = true });
            }
            return Json(new { success = false });
        }

    }
}
