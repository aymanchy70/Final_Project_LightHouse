namespace FinalProject_API.DTOs.ItemCategory
{
    public class ItemCategoryResponseDto
    {
        public int ItemCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
