namespace FinalProject_API.DTOs.PurchaseOrder
{
    public class PurchaseOrderResponseDto
    {
        public int PurchaseOrderId { get; set; }
        public string PO_Number { get; set; } = string.Empty;
        public int SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime ReceiveDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ApprovedDate { get; set; }
        public decimal AdditionalCharge { get; set; }
        public decimal? OrderTotal => (Items?.Sum(i => i.LineTotal) ?? 0) + AdditionalCharge; public string? Notes { get; set; }
        public List<PurchaseOrderItemResponseDto> Items { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
