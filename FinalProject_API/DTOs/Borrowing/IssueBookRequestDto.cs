using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Borrowing
{
    public class IssueBookRequestDto
    {
        [Required]
        public int MemberId { get; set; }

        [Required]
        public int PhysicalCopyId { get; set; }
    }
}
