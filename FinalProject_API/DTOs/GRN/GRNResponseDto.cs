namespace FinalProject_API.DTOs.GRN
{
    public class GRNResponseDto
    {
        public int GRNId { get; set; }
        public string GRN_Number { get; set; } = string.Empty;
        public DateTime ReceivedDate { get; set; }
        public string? ReceivedBy { get; set; }
        public string? VehicleNumber { get; set; }
        public string? DeliveryPersonName { get; set; }
        public string? Notes { get; set; }
        public List<GRNItemResponseDto> Items { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class GRNItemResponseDto
    {
        public int GRNItemId { get; set; }
        public int PurchaseOrderItemId { get; set; }
        public string? BookTitle { get; set; }
        public string? Edition { get; set; }
        public int Quantity { get; set; }
        public int? ShelfId { get; set; }
        public string? ShelfCode { get; set; }
        public string? PO_Number { get; set; }
    }
}
