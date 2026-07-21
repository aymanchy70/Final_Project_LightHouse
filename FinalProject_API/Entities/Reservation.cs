using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class Reservation : BaseEntity
    {
        [Key]
        public int ReservationId { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public int BookEditionId { get; set; }

        public DateTime ReservationDate { get; set; } = DateTime.Now;

        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Fulfilled, Cancelled

        public DateTime? FulfilledAt { get; set; }

        [ForeignKey(nameof(MemberId))]
        public virtual Member? Member { get; set; }

        [ForeignKey(nameof(BookEditionId))]
        public virtual BookEdition? BookEdition { get; set; }
    }
}
