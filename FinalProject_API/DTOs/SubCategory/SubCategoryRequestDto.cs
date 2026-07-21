using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.SubCategory
{
    public class SubCategoryRequestDto
    {
        [Required(ErrorMessage = "SubCategory Name is required")]
        [StringLength(100, ErrorMessage = "SubCategory Name cannot exceed 100 characters")]
        [Display(Name = "SubCategory Name")]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        [Display(Name = "Description")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Category is required")]
        [Display(Name = "Category")]
        public int CategoryId { get; set; }

    }
}

