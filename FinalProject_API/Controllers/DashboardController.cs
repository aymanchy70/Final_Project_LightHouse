using FinalProject_API.Data;
using FinalProject_API.DTOs.Dashboard;
using FinalProject_API.DTOs.Member;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinalProject_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("admin-stats")]
        public async Task<ActionResult<AdminDashboardDto>> GetAdminStats()
        {
            var stats = new AdminDashboardDto
            {
                // Location
                Floors = await _context.Floors.CountAsync(f => f.IsActive),
                Sections = await _context.Sections.CountAsync(s => s.IsActive),
                Racks = await _context.Racks.CountAsync(r => r.IsActive),
                Shelves = await _context.Shelves.CountAsync(sh => sh.IsActive),

                // Catalog
                Categories = await _context.ItemCategories.CountAsync(c => c.IsActive),
                SubCategories = await _context.SubCategories.CountAsync(sc => sc.IsActive),
                Authors = await _context.Authors.CountAsync(a => a.IsActive),
                Publishers = await _context.Publishers.CountAsync(p => p.IsActive),

                // Books & Stock
                TotalBooks = await _context.Books.CountAsync(b => b.IsActive),
                BookEditions = await _context.BookEditions.CountAsync(be => be.IsActive),
                AvailableCopies = await _context.PhysicalCopies.CountAsync(pc => pc.Status == "Available" && pc.IsActive),

                // Members
                TotalMembers = await _context.Members.CountAsync(m => m.MembershipStatus == "Approved" && m.IsActive),
                PendingMembershipRequests = await _context.Members.CountAsync(m => m.MembershipStatus == "PendingApproval" && m.IsActive),

                // Circulation
                ActiveBorrowings = await _context.BorrowingRecords.CountAsync(br => (br.Status == "Borrowed" || br.Status == "Overdue") && br.IsActive),
                OverdueBorrowings = await _context.BorrowingRecords.CountAsync(br => br.Status == "Overdue" && br.IsActive),
                PendingBookRequests = await _context.BorrowingRecords.CountAsync(br => br.Status == "Pending" && br.IsActive),
                PendingReservations = await _context.Reservations.CountAsync(r => r.Status == "Pending" && r.IsActive),

                // Finance
                OutstandingFines = await _context.Members.Where(m => m.IsActive).SumAsync(m => m.OutstandingFine)
            };

            return Ok(stats);
        }


        [HttpGet("member-stats")]
        [Authorize]
        public async Task<ActionResult<MemberDashboardDto>> GetMemberStats()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId && m.IsActive);
            if (member == null) return NotFound("Member record not found.");

            var stats = new MemberDashboardDto
            {
                MembershipStatus = member.MembershipStatus,
                OutstandingFine = member.OutstandingFine,
                ActiveBorrowings = await _context.BorrowingRecords.CountAsync(br =>
                    br.MemberId == member.MemberId && (br.Status == "Borrowed" || br.Status == "Overdue") && br.IsActive),
                PendingRequests = await _context.BorrowingRecords.CountAsync(br =>
                    br.MemberId == member.MemberId && br.Status == "Pending" && br.IsActive),
                Reservations = await _context.Reservations.CountAsync(r =>
                    r.MemberId == member.MemberId && r.Status == "Pending" && r.IsActive)
            };

            return Ok(stats);
        }
    }
}
