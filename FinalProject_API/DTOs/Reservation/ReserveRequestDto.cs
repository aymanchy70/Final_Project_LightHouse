using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Reservation
{
    public class ReserveRequestDto
    {
        [Required]
        public int MemberId { get; set; }        // For testing (later you’ll use JWT)

        [Required]
        public int BookEditionId { get; set; }
    }
}
