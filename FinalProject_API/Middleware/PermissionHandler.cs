using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using FinalProject_API.Entities;

namespace FinalProject_API.Middleware
{
    /// <summary>
    /// A requirement that carries the permission name to check.
    /// </summary>
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }
        public PermissionRequirement(string permission) => Permission = permission;
    }

    /// <summary>
    /// Checks whether the current user has the required permission
    /// via any of their assigned roles.
    /// </summary>
    public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly UserManager<IdentityUser<int>> _userManager;

        public PermissionHandler(
            RoleManager<IdentityRole<int>> roleManager,
            UserManager<IdentityUser<int>> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            if (context.User.Identity?.IsAuthenticated != true)
                return;

            var user = await _userManager.GetUserAsync(context.User);
            if (user == null)
                return;

            var roleNames = await _userManager.GetRolesAsync(user);
            foreach (var roleName in roleNames)
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null) continue;

                var claims = await _roleManager.GetClaimsAsync(role);
                if (claims.Any(c => c.Type == "Permission" && c.Value == requirement.Permission))
                {
                    context.Succeed(requirement);
                    return;
                }
            }
        }
    }
}