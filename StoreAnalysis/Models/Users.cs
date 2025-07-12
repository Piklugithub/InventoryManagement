using System.ComponentModel.DataAnnotations;

namespace StoreAnalysis.Models
{
    public class Users
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string Password { get; set; }
        public byte[]? ProfilePicture { get; set; }
    }
}
