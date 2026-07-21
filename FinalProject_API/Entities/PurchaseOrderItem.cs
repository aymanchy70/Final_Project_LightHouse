using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class PurchaseOrderItem : BaseEntity
    {
        [Key]
        public int PurchaseOrderItemId { get; set; }

        [Required]
        public int PurchaseOrderId { get; set; }

        [Required]
        public int BookEditionId { get; set; }

        [Required, Range(1, 1000)]
        public int Quantity { get; set; }            // Ordered quantity

        public int ReceivedQuantity { get; set; } = 0;  // Total received so far

        [Column(TypeName = "decimal(10,2)")]
        public decimal? UnitCost { get; set; }

        [ForeignKey(nameof(PurchaseOrderId))]
        public virtual PurchaseOrder? PurchaseOrder { get; set; }

        [ForeignKey(nameof(BookEditionId))]
        public virtual BookEdition? BookEdition { get; set; }
    }
}
