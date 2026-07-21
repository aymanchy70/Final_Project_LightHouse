using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class DigitalCopy : BaseEntity
    {
        [Key]
        public int DigitalCopyId { get; set; }

        [Required]
        public int BookEditionId { get; set; }

        [Required, StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [StringLength(10)]
        public string FileFormat { get; set; } = "PDF";

        public double FileSizeInMB { get; set; }

        public int PreviewPages { get; set; } = 5;

        public DateTime UploadedAt { get; set; } = DateTime.Now;

        // ✅ Correct ForeignKey attribute
        [ForeignKey(nameof(BookEditionId))]
        public virtual BookEdition? BookEdition { get; set; }
    }
}
