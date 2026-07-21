using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class PurchaseOrder : BaseEntity
    {
        [Key]
        public int PurchaseOrderId { get; set; }

        // Auto‑generated PO number (e.g., PO-2026-0001)
        [Required]
        [StringLength(20)]
        public string PO_Number { get; set; } = string.Empty;

        [Required]
        public int SupplierId { get; set; }
        required
        public DateTime OrderDate { get; set; } = DateTime.Now;
        [Required]
        public DateTime ReceiveDate { get; set; }

        // Status: PendingApproval, Approved, PartiallyReceived, Completed, Cancelled
        [StringLength(20)]
        public string Status { get; set; } = "PendingApproval";

        public DateTime? ApprovedDate { get; set; }
        [Column(TypeName = "decimal(10,2)")]
        public decimal AdditionalCharge { get; set; } = 0;

        [StringLength(500)]
        public string? Notes { get; set; }

        [ForeignKey(nameof(SupplierId))]
        public virtual Supplier? Supplier { get; set; }

        public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    }
}
