using Microsoft.AspNetCore.Mvc;
using StoreAnalysis.Models;

namespace StoreAnalysis.Controllers
{
    public class UserController : Controller
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Login() => View();

        public IActionResult Register() => View();
        [HttpPost]
        public IActionResult LoginUser([FromBody] Users model)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == model.Email && u.Password == model.Password);
            //return Json(user != null
            //    ? new { success = true, message = "Login successful", userName = user.FullName } : new { success = false, message = "Invalid credentials" });

            if (user != null)
            {
                string base64Image = user.ProfilePicture != null ? Convert.ToBase64String(user.ProfilePicture) : null;

                return Json(new
                {
                    success = true,
                    message = "Login successful",
                    userName = user.FullName,
                    profileImage = base64Image // 👈 add image as base64 string
                });
            }
            else
            {
                return Json(new
                {
                    success = false,
                    message = "Invalid credentials"
                });
            }
        }

        //[HttpPost]
        //public IActionResult RegisterUser([FromBody] Users model)
        //{
        //    if (_context.Users.Any(u => u.Email == model.Email))
        //        return Json(new { success = false, message = "Email already exists" });

        //    _context.Users.Add(model);
        //    _context.SaveChanges();

        //    return Json(new { success = true, message = "Registered successfully" });
        //}
        [HttpPost]
        public async Task<IActionResult> RegisterUser(RegisterViewModel model)
        {
            if (_context.Users.Any(u => u.Email.ToLower() == model.Email.ToLower()))
            {
                return Json(new { success = false, message = "Email already exists" });
            }

            byte[]? imageBytes = null;
            if (model.ProfilePicture != null)
            {
                using (var ms = new MemoryStream())
                {
                    await model.ProfilePicture.CopyToAsync(ms);
                    imageBytes = ms.ToArray();
                }
            }

            var user = new Users
            {
                FullName = model.FullName,
                Email = model.Email,
                Password = model.Password,
                ProfilePicture = imageBytes
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Json(new { success = true, message = "User registered successfully" });
        }



    }
}
