using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class GRNItem:BaseEntity
    {
        [Key]
        public int GRNItemId { get; set; }

        [Required]
        public int GRNId { get; set; }

        [Required]
        public int PurchaseOrderItemId { get; set; }   // Links to the specific PO line item

        [Required]
        public int Quantity { get; set; }

        public int ShelfId { get; set; }

        [ForeignKey(nameof(GRNId))]
        public virtual GRN? GRN { get; set; }

        [ForeignKey(nameof(PurchaseOrderItemId))]
        public virtual PurchaseOrderItem? PurchaseOrderItem { get; set; }

        [ForeignKey(nameof(ShelfId))]
        public virtual Shelf? Shelf { get; set; }
    }
}
