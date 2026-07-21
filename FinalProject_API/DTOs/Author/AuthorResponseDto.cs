namespace FinalProject_API.DTOs.Author
{
    public class AuthorResponseDto
    {
        public int AuthorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Pseudonym { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public string? Nationality { get; set; }
        public string? Biography { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
