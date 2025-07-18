using Microsoft.AspNetCore.Mvc;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class SupplierController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SupplierController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult GetAll()
        {
            var suppliers = _context.Suppliers
                .Where(s => !s.IsDelete)
                .Select(s => new
                {
                    s.SupplierId,
                    s.SupplierName,
                    s.ContactPerson,
                    s.PhoneNumber,
                    s.Email,
                    s.Address,
                    Status = s.IsActive ? "Active" : "Inactive"
                })
                .ToList();

            return Json(suppliers);
        }
        [HttpGet]
        public IActionResult GetById(int id)
        {
            var supplier = _context.Suppliers.FirstOrDefault(s => s.SupplierId == id);
            if (supplier == null)
                return NotFound();

            return Json(supplier);
        }
        [HttpPost]
        public IActionResult Save([FromBody] Supplier model)
        {
            if (model == null || string.IsNullOrEmpty(model.SupplierName))
                return BadRequest(new { success = false, message = "Invalid data." });

            try
            {
                if (model.SupplierId == 0)
                {
                    model.CreatedDate = DateTime.Now;
                    model.IsActive = true;
                    _context.Suppliers.Add(model);
                }
                else
                {
                    var existing = _context.Suppliers.Find(model.SupplierId);
                    if (existing == null)
                        return NotFound(new { success = false, message = "Supplier not found." });

                    // Only updating editable fields from inline form
                    existing.SupplierName = model.SupplierName ?? existing.SupplierName;
                    existing.PhoneNumber = model.PhoneNumber ?? existing.PhoneNumber;
                    existing.Email = model.Email ?? existing.Email;
                    existing.IsActive = model.IsActive;// Update IsActive only if provided
                    // For full modal: also update Address, ContactPerson, IsActive
                }

                _context.SaveChanges();
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var supplier = _context.Suppliers.Find(id);
            if (supplier == null)
                return NotFound(new { success = false, message = "Supplier not found." });

            supplier.IsDelete = true; // Soft delete
            _context.SaveChanges();

            return Json(new { success = true });
        }
    }
}
