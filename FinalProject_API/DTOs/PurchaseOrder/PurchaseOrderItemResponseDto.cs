namespace FinalProject_API.DTOs.PurchaseOrder
{
    public class PurchaseOrderItemResponseDto
    {
        public int PurchaseOrderItemId { get; set; }
        public int BookEditionId { get; set; }
        public string? BookTitle { get; set; }
        public string? Edition { get; set; }

        public int OrderedQuantity { get; set; }      // renamed from Quantity
        public int ReceivedQuantity { get; set; }
        public decimal? LineTotal => UnitCost * OrderedQuantity;// NEW
        public int RemainingQuantity { get; set; }    // NEW
        public decimal? UnitCost { get; set; }
    }
}
