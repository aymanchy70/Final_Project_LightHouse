namespace FinalProject_API.DTOs.Section
{
    public class SectionResponseDto
    {
        public int SectionId { get; set; }
        public int FloorId { get; set; }
        public string FloorCode { get; set; } = string.Empty;
        public string SectionCode { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;
        public string? DDCRangeStart { get; set; }
        public string? DDCRangeEnd { get; set; }
        public bool IsSpecial { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
