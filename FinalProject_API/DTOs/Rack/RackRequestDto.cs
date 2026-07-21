using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Rack
{
    public class RackRequestDto
    {
        [Required]
        public int SectionId { get; set; }

        [Required, StringLength(20)]
        public string RackCode { get; set; } = string.Empty;

        [StringLength(150)]
        public string? RackName { get; set; }

        [Range(1, 20)]
        public int TotalShelves { get; set; } = 6;

        [StringLength(10)]
        public string? DDCRangeStart { get; set; }

        [StringLength(10)]
        public string? DDCRangeEnd { get; set; }
    }
}
