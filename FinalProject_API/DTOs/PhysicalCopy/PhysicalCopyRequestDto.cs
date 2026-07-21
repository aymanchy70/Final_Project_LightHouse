using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.PhysicalCopy
{
    public class PhysicalCopyRequestDto
    {
        [Required]
        public int BookEditionId { get; set; }

        [StringLength(20)]
        public string BaseLibraryCode { get; set; } = string.Empty;

        [StringLength(50)]
        public string Barcode { get; set; } = string.Empty;

        public int? ShelfId { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "Available";

        [StringLength(50)]
        public string? CurrentCondition { get; set; }

        public DateTime? AcquiredDate { get; set; }
        public decimal? AcquiredCost { get; set; }

        public int? SupplierId { get; set; }
        [StringLength(50)]
        public string? PurchaseInvoice { get; set; }

        public bool IsReference { get; set; }
        public string? Notes { get; set; }
    }
}
