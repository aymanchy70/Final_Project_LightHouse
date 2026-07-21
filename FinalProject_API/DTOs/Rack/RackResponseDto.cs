namespace FinalProject_API.DTOs.Rack
{
    public class RackResponseDto
    {
        public int RackId { get; set; }
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string? FloorCode { get; set; }
        public string RackCode { get; set; } = string.Empty;
        public string? RackName { get; set; }
        public int TotalShelves { get; set; }
        public string? DDCRangeStart { get; set; }
        public string? DDCRangeEnd { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
