using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.PhysicalCopy
{
    public class PhysicalCopyBulkRequestDto
    {
        [Required]
        public int BookEditionId { get; set; }

        [Required, Range(1, 200)]
        public int Quantity { get; set; }

        public int? ShelfId { get; set; }

        public DateTime? AcquiredDate { get; set; }
        public decimal? AcquiredCost { get; set; }

        [StringLength(100)]
        public string? Supplier { get; set; }

        [StringLength(50)]
        public string? PurchaseInvoice { get; set; }

        public bool IsReference { get; set; }
        public string? Notes { get; set; }
    }
}
