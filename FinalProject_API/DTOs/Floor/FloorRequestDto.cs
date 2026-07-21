using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Floor
{
    public class FloorRequestDto
    {
        [Required, StringLength(10)]
        public string FloorCode { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string FloorName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }
    }
}
