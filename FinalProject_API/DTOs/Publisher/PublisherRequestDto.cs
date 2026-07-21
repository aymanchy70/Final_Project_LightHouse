using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Publisher
{
    public class PublisherRequestDto
    {
        [Required(ErrorMessage = "Publisher Name is required")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Address { get; set; }

        [StringLength(50)]
        public string? Phone { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(200)]
        public string? Website { get; set; }
    }
}
