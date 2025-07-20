using Microsoft.AspNetCore.Mvc;
using StoreAnalysis.Models;
using System.Net;
using System.Net.Mail;

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
            var user = _context.Users.FirstOrDefault(u => u.Email == model.Email);
            //return Json(user != null
            //    ? new { success = true, message = "Login successful", userName = user.FullName } : new { success = false, message = "Invalid credentials" });

            //if (user != null && BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            //{
            //    string base64Image = user.ProfilePicture != null ? Convert.ToBase64String(user.ProfilePicture) : null;

            //    return Json(new
            //    {
            //        success = true,
            //        message = "Login successful",
            //        userName = user.FullName,
            //        profileImage = base64Image // 👈 add image as base64 string
            //    });
            //}
            if (user != null && BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            {
                string otp = new Random().Next(100000, 999999).ToString();
                user.OTP = otp;
                user.OTPGeneratedAt = DateTime.Now;
                _context.SaveChanges();

                SendEmail(user.Email, "Your OTP Code", $"Your OTP is <b>{otp}</b>");

                //HttpContext.Session.SetString("UserEmail", user.Email);
                //HttpContext.Session.SetString("OTP", otp);

                return Json(new { status = "otp" });
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
            // Hash password using BCrypt
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);
            var user = new Users
            {
                FullName = model.FullName,
                Email = model.Email,
                Password = hashedPassword,
                ProfilePicture = imageBytes
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Json(new { success = true, message = "User registered successfully" });
        }
        private void SendEmail(string toEmail, string subject, string body)
        {
            var client = new SmtpClient("sandbox.smtp.mailtrap.io") // or smtp.gmail.com
            {
                Port = 587,
                Credentials = new NetworkCredential("64670fbfb5d43f", "1054a3f3a0f820"),
                EnableSsl = true
            };

            var message = new MailMessage("pritamsamanta2808@gmail.com", toEmail, subject, body)
            {
                IsBodyHtml = true
            };

            client.Send(message);
        }
        [HttpPost]
        public IActionResult VerifyOtp(string otp, string email)
        {

            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user != null && user.OTP == otp && user.OTPGeneratedAt > DateTime.Now.AddMinutes(-5))
            {
                string base64Image = user.ProfilePicture != null ? Convert.ToBase64String(user.ProfilePicture) : null;

                return Json(new
                {
                    success = true,
                    message = "Validate User",
                    userName = user.FullName,
                    profileImage = base64Image // 👈 add image as base64 string
                });
            }

            return Json(new { success = false, message = "Invalid or expired OTP." });
        }


    }
}
