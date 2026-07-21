namespace FinalProject_API.DTOs.SubCategory
{
    public class SubCategoryResponseDto
    {
        public int SubCategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }   // Optional: Include parent category name for convenience
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
