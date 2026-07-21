using Microsoft.AspNetCore.Identity;

namespace FinalProject_API.Entities
{
    public class RolePermission
    {
        public int RoleId { get; set; }
        public IdentityRole<int> Role { get; set; } = null!;

        public int PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}
