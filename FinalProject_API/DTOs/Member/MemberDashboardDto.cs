namespace FinalProject_API.DTOs.Member
{
    public class MemberDashboardDto
    {
        public string? MembershipStatus { get; set; }
        public decimal OutstandingFine { get; set; }
        public int ActiveBorrowings { get; set; }
        public int PendingRequests { get; set; }
        public int Reservations { get; set; }
    }
}
