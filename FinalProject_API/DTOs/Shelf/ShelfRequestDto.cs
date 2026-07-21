using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Shelf
{
    public class ShelfRequestDto
    {
        [Required]
        public int RackId { get; set; }

        [Required, StringLength(30)]
        public string ShelfCode { get; set; } = string.Empty;

        [Range(1, 20)]
        public int ShelfLevel { get; set; } = 1;

        [StringLength(20)]
        public string ShelfLabel { get; set; } = string.Empty;

        [Range(1, 200)]
        public int MaxCapacity { get; set; } = 80;

        [StringLength(10)]
        public string? DDCRangeStart { get; set; }

        [StringLength(10)]
        public string? DDCRangeEnd { get; set; }
    }
}
