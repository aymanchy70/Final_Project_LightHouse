using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.ItemCategory
{
    public class ItemCategoryRequestDto
    {
        [Required(ErrorMessage = "Category Name is required")]
        [StringLength(100, ErrorMessage = "Category Name cannot exceed 100 characters")]
        [Display(Name = "Category Name")]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(250)]
        [Display(Name = "Description")]
        public string? CategoryDescription { get; set; }


    }
}
