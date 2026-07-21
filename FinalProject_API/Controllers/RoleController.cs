using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinalProject_API.Entities;
using FinalProject_API.Data;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]               // only admins can access this entire controller
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly UserManager<IdentityUser<int>> _userManager;
        private readonly AppDbContext _context;

        public RoleController(
            RoleManager<IdentityRole<int>> roleManager,
            UserManager<IdentityUser<int>> userManager,
            AppDbContext context)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }

        // ─── Roles ──────────────────────────────────────────────

        // GET /api/Role
        [HttpGet]
        public async Task<ActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var result = new List<object>();
            foreach (var role in roles)
            {
                var claims = await _roleManager.GetClaimsAsync(role);
                result.Add(new
                {
                    role.Id,
                    role.Name,
                    Permissions = claims.Where(c => c.Type == "Permission").Select(c => c.Value)
                });
            }
            return Ok(result);
        }

        // POST /api/Role
        [HttpPost]
        public async Task<ActionResult> CreateRole([FromBody] string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return BadRequest("Role name is required.");

            var result = await _roleManager.CreateAsync(new IdentityRole<int>(roleName));
            if (result.Succeeded)
                return Ok(new { message = $"Role '{roleName}' created." });

            return BadRequest(result.Errors);
        }

        // DELETE /api/Role/{roleName}
        [HttpDelete("{roleName}")]
        public async Task<ActionResult> DeleteRole(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null) return NotFound();

            var result = await _roleManager.DeleteAsync(role);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{roleName}' deleted." });

            return BadRequest(result.Errors);
        }

        // ─── Permissions ────────────────────────────────────────

        // POST /api/Role/{roleName}/permissions
        [HttpPost("{roleName}/permissions")]
        public async Task<ActionResult> AddPermissionToRole(string roleName, [FromBody] string permission)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null) return NotFound("Role not found.");

            var claim = new System.Security.Claims.Claim("Permission", permission);
            var result = await _roleManager.AddClaimAsync(role, claim);
            if (result.Succeeded)
                return Ok(new { message = $"Permission '{permission}' added to role '{roleName}'." });

            return BadRequest(result.Errors);
        }

        // DELETE /api/Role/{roleName}/permissions/{permission}
        [HttpDelete("{roleName}/permissions/{permission}")]
        public async Task<ActionResult> RemovePermissionFromRole(string roleName, string permission)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null) return NotFound();

            var claim = new System.Security.Claims.Claim("Permission", permission);
            var result = await _roleManager.RemoveClaimAsync(role, claim);
            if (result.Succeeded)
                return Ok(new { message = $"Permission '{permission}' removed from role '{roleName}'." });

            return BadRequest(result.Errors);
        }

        // ─── User‑Role Assignment ────────────────────────────────

        // GET /api/Role/users
        [HttpGet("users")]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new
                {
                    user.Id,
                    user.Email,
                    Roles = roles
                });
            }
            return Ok(result);
        }

        // POST /api/Role/users/{userId}/roles
        [HttpPost("users/{userId}/roles")]
        public async Task<ActionResult> AssignRoleToUser(int userId, [FromBody] string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound("User not found.");

            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{roleName}' assigned to user {userId}." });

            return BadRequest(result.Errors);
        }

        // DELETE /api/Role/users/{userId}/roles/{roleName}
        [HttpDelete("users/{userId}/roles/{roleName}")]
        public async Task<ActionResult> RemoveRoleFromUser(int userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound();

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (result.Succeeded)
                return Ok(new { message = $"Role '{roleName}' removed from user {userId}." });

            return BadRequest(result.Errors);
        }

        [HttpPost("seed-admin-permissions")]
        public async Task<IActionResult> SeedAdminPermissions()
        {
            var adminRole = await _roleManager.FindByNameAsync("Admin");
            if (adminRole == null) return NotFound("Admin role not found.");

            var allPermissions = await _context.Permissions.ToListAsync();
            int added = 0;

            foreach (var perm in allPermissions)
            {
                var claim = new System.Security.Claims.Claim("Permission", perm.Name);
                var existingClaims = await _roleManager.GetClaimsAsync(adminRole);
                if (!existingClaims.Any(c => c.Type == "Permission" && c.Value == perm.Name))
                {
                    await _roleManager.AddClaimAsync(adminRole, claim);
                    added++;
                }
            }

            return Ok(new { message = $"{added} permission claims added to Admin role." });
        }
    }
}