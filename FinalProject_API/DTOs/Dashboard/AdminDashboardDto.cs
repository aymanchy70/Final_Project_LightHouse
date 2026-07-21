namespace FinalProject_API.DTOs.Dashboard
{
    public class AdminDashboardDto
    {
        // Location
        public int Floors { get; set; }
        public int Sections { get; set; }
        public int Racks { get; set; }
        public int Shelves { get; set; }

        // Catalog
        public int Categories { get; set; }
        public int SubCategories { get; set; }
        public int Authors { get; set; }
        public int Publishers { get; set; }

        // Books & Stock
        public int TotalBooks { get; set; }
        public int BookEditions { get; set; }
        public int AvailableCopies { get; set; }

        // Members
        public int TotalMembers { get; set; }
        public int PendingMembershipRequests { get; set; }

        // Circulation
        public int ActiveBorrowings { get; set; }
        public int OverdueBorrowings { get; set; }
        public int PendingBookRequests { get; set; }
        public int PendingReservations { get; set; }

        // Finance
        public decimal OutstandingFines { get; set; }
    }
}
