namespace FinalProject_API.DTOs.Shelf
{
    public class ShelfResponseDto
    {
        public int ShelfId { get; set; }
        public int RackId { get; set; }
        public string RackCode { get; set; } = string.Empty;
        public string? SectionCode { get; set; }
        public string? FloorCode { get; set; }
        public string ShelfCode { get; set; } = string.Empty;
        public int ShelfLevel { get; set; }
        public string ShelfLabel { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public string? DDCRangeStart { get; set; }
        public string? DDCRangeEnd { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
