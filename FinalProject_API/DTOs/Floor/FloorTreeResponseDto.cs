namespace FinalProject_API.DTOs.Floor
{
    public class FloorTreeResponseDto
    {
        public int FloorId { get; set; }
        public string FloorCode { get; set; } = string.Empty;
        public string FloorName { get; set; } = string.Empty;
        public List<SectionTreeDto> Sections { get; set; } = new();
    }

    public class SectionTreeDto
    {
        public int SectionId { get; set; }
        public string SectionCode { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;
        public List<RackTreeDto> Racks { get; set; } = new();
    }

    public class RackTreeDto
    {
        public int RackId { get; set; }
        public string RackCode { get; set; } = string.Empty;
        public string? RackName { get; set; }
        public List<ShelfTreeDto> Shelves { get; set; } = new();
    }

    public class ShelfTreeDto
    {
        public int ShelfId { get; set; }
        public string ShelfCode { get; set; } = string.Empty;
        public int ShelfLevel { get; set; }
        public int MaxCapacity { get; set; }
        public int OccupiedCount { get; set; }   // optionally fill later
    }
}
