using System.ComponentModel.DataAnnotations;

namespace FinalProject_API.DTOs.Member
{
    public class MembershipApplicationDto
    {
        [Required]
        public int MembershipTypeId { get; set; }
    }
}
