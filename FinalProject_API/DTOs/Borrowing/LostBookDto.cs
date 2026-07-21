namespace FinalProject_API.DTOs.Borrowing
{
    public class LostBookDto
    {
        public string LossType { get; set; } = "Lost";   // "Lost" or "Damaged"
        public string? LossReason { get; set; }
    }
}
