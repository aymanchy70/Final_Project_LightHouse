using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Author
{
    public class AuthorRequestDto
    {
        [Required(ErrorMessage = "Full Name is required")]
        [StringLength(150, ErrorMessage = "Full Name cannot exceed 150 characters")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(150)]
        public string? Pseudonym { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfDeath { get; set; }

        [StringLength(100)]
        public string? Nationality { get; set; }

        [StringLength(2000)]
        public string? Biography { get; set; }

        [StringLength(500)]
        public string? PhotoUrl { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [Display(Name = "Photo")]
        public IFormFile? PhotoFile { get; set; }
    }
}
