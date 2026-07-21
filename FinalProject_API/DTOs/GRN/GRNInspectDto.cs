using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.GRN
{
    public class GRNInspectDto
    {
        [Required]
        public string InspectedBy { get; set; } = string.Empty;

        public DateTime InspectionDate { get; set; } = DateTime.Now;

        [StringLength(500)]
        public string? InspectionNotes { get; set; }

        public List<GRNInspectItemDto>? Items { get; set; }
    }

    public class GRNInspectItemDto
    {
        public int GRNItemId { get; set; }
        public bool IsAccepted { get; set; }
        public string? RejectionReason { get; set; }
    }
}
