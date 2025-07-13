using Microsoft.AspNetCore.Mvc;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class BrandController : Controller
    {
        private readonly ApplicationDbContext _context;

        public BrandController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            ViewBag.Categories = _context.Categories.ToList();
            return View();
        }
        [HttpGet]
        public IActionResult GetBrandsByCategory(int categoryId)
        {
            var brands = _context.Brands
                .Where(b => b.CategoryId == categoryId)
                .Select(b => new { b.Id, b.Name, b.IsActive })
                .ToList();

            return Json(brands);
        }

        [HttpPost]
        public IActionResult AddBrand([FromBody] Brand brand)
        {
            _context.Brands.Add(brand);
            _context.SaveChanges();
            return Ok();
        }

        [HttpPost]
        public IActionResult UpdateBrand([FromBody] Brand brand)
        {
            var existing = _context.Brands.Find(brand.Id);
            if (existing != null)
            {
                existing.Name = brand.Name;
                existing.IsActive = brand.IsActive;
                _context.SaveChanges();
            }
            return Ok();
        }
        [HttpPost]
        public IActionResult AddCategory([FromBody] Category model)
        {
            if (string.IsNullOrWhiteSpace(model.Name))
                return BadRequest("Category name is required.");

            _context.Categories.Add(model);
            _context.SaveChanges();

            return Json(new { model.Id, model.Name });
        }

        [HttpPost]
        public IActionResult DeleteBrand(int id)
        {
            var brand = _context.Brands.Find(id);
            if (brand != null)
            {
                _context.Brands.Remove(brand);
                _context.SaveChanges();
            }
            return Ok();
        }
    }
}
