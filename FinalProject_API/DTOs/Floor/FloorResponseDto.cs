namespace FinalProject_API.DTOs.Floor
{
    public class FloorResponseDto
    {
        public int FloorId { get; set; }
        public string FloorCode { get; set; } = string.Empty;
        public string FloorName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
