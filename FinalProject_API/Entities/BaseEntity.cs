using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.Entities
{
    public class BaseEntity
    {
        public bool IsActive { get; set; } = true;

        [Display(Name = "Created By")]
        public string? CreatedBy { get; set; }

        [Display(Name = "Updated By")]
        public string? UpdatedBy { get; set; }

        [Display(Name = "Created Date")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [Display(Name = "Updated Date")]
        public DateTime? UpdatedDate { get; set; }

    }
}
