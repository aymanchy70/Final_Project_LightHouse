using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Section
{
    public class SectionRequestDto
    {
        [Required]
        public int FloorId { get; set; }

        [Required, StringLength(20)]
        public string SectionCode { get; set; } = string.Empty;

        [Required, StringLength(150)]
        public string SectionName { get; set; } = string.Empty;

        [StringLength(10)]
        public string? DDCRangeStart { get; set; }

        [StringLength(10)]
        public string? DDCRangeEnd { get; set; }

        public bool IsSpecial { get; set; } = false;
    }
}
