namespace FinalProject_API.DTOs.Reservation
{
    public class ReservationResponseDto
    {
        public int ReservationId { get; set; }
        public int MemberId { get; set; }
        public string? MemberName { get; set; }
        public int BookEditionId { get; set; }
        public string? BookTitle { get; set; }
        public string? Edition { get; set; }
        public DateTime ReservationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? FulfilledAt { get; set; }
    }
}
