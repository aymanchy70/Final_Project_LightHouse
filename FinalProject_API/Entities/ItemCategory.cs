using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class ItemCategory: BaseEntity
    {
        [Key]
        public int ItemCategoryId { get; set; }

        [Required(ErrorMessage = "Category Name is required")]
        [StringLength(100, ErrorMessage = "Category Name cannot exceed 100 characters")]
        [Display(Name = "Category Name")]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(250)]
        [Display(Name = "Description")]
        public string? CategoryDescription { get; set; }

        public ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
        public ICollection<Book> Books { get; set; } = new List<Book>();

    }
}
