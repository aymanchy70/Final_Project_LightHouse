using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class Author : BaseEntity
    {
        [Key]
        public int AuthorId { get; set; }

        [Required(ErrorMessage = "Full Name is required")]
        [StringLength(150, ErrorMessage = "Full Name cannot exceed 150 characters")]
        [Display(Name = "Full Name")]
        public string FullName { get; set; } = string.Empty;

        [StringLength(150)]
        [Display(Name = "Pseudonym / Pen Name")]
        public string? Pseudonym { get; set; }

        [DataType(DataType.Date)]
        [Display(Name = "Date of Birth")]
        public DateTime? DateOfBirth { get; set; }

        [DataType(DataType.Date)]
        [Display(Name = "Date of Death")]
        public DateTime? DateOfDeath { get; set; }

        [StringLength(100)]
        [Display(Name = "Nationality")]
        public string? Nationality { get; set; }

        [StringLength(2000)]
        [Display(Name = "Biography")]
        public string? Biography { get; set; }

        [StringLength(500)]
        [Display(Name = "Photo URL")]
        public string? PhotoUrl { get; set; }

        [EmailAddress]
        [StringLength(100)]
        [Display(Name = "Email")]
        public string? Email { get; set; }

        public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}
