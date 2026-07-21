namespace FinalProject_API.DTOs.PhysicalCopy
{
    public class PhysicalCopyResponseDto
    {
        public int PhysicalCopyId { get; set; }
        public int BookEditionId { get; set; }
        public string EditionInfo { get; set; } = string.Empty;
        public string? BookTitle { get; set; }
        public string BaseLibraryCode { get; set; } = string.Empty;
        public int CopySerialNumber { get; set; }
        public string FullLibraryCode { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public int? ShelfId { get; set; }
        public string? ShelfCode { get; set; }
        public int? PositionOnShelf { get; set; }
        public string? Status { get; set; }
        public string? CurrentCondition { get; set; }
        public DateTime? AcquiredDate { get; set; }
        public decimal? AcquiredCost { get; set; }
        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }  // from navigation
        public string? PurchaseInvoice { get; set; }
        public bool IsReference { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
