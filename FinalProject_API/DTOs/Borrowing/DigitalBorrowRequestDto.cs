using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Borrowing
{
    public class DigitalBorrowRequestDto
    {
        [Required]
        public int DigitalCopyId { get; set; }
    }
}
