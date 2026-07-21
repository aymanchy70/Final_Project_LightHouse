using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class SubCategory:BaseEntity
    {
        [Key]
        public int SubCategoryId { get; set; }

        [Required(ErrorMessage = "SubCategory Name is required")]
        [StringLength(100, ErrorMessage = "SubCategory Name cannot exceed 100 characters")]
        [Display(Name = "SubCategory Name")]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        [Display(Name = "Description")]
        public string? Description { get; set; }

        // Foreign Key
        [Required(ErrorMessage = "Category is required")]
        [Display(Name = "Category")]
        public int CategoryId { get; set; }

        // Navigation Properties (will add Books later when we implement Book entity)
        [ForeignKey("CategoryId")]
        public virtual ItemCategory? ItemCategory { get; set; }

        // Books collection will be added when we create Book entity
         public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
