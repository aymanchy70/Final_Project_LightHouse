using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProject_API.Entities
{
    public class PhysicalCopy : BaseEntity
    {
        [Key]
        public int PhysicalCopyId { get; set; }

        // FK to BookEdition
        [Required]
        public int BookEditionId { get; set; }

        // Identification
        [StringLength(20)]
        public string BaseLibraryCode { get; set; } = string.Empty;

        public int CopySerialNumber { get; set; }

        public string FullLibraryCode => $"{BaseLibraryCode}-{CopySerialNumber:D3}";

        [StringLength(50)]
        public string Barcode { get; set; } = string.Empty;

        // Location
        public int? ShelfId { get; set; }
        public int? PositionOnShelf { get; set; }

        // QR Code (nullable for now)
        public string? QRCodeData { get; set; }
        public string? QRCodeImageUrl { get; set; }

        // RFID (for future)
        public string? RFIDTagId { get; set; }
        public bool HasRFID { get; set; }

        // Status
        [StringLength(20)]
        public string Status { get; set; } = "Available"; // Available, Borrowed, Lost, Damaged, UnderRepair, Disposed

        [StringLength(50)]
        public string? CurrentCondition { get; set; } // New, Good, Worn, Damaged

        // Acquisition
        public DateTime? AcquiredDate { get; set; }
        public decimal? AcquiredCost { get; set; }

        public int? SupplierId { get; set; }

        [ForeignKey(nameof(SupplierId))]
        public virtual Supplier? Supplier { get; set; }
        [StringLength(50)]
        public string? PurchaseInvoice { get; set; }

        // Tracking
        public DateTime? LastInventoryCheck { get; set; }
        public int CheckedOutCount { get; set; }
        public bool IsReference { get; set; } // Cannot leave library
        public string? Notes { get; set; }

        // Navigation
        [ForeignKey(nameof(BookEditionId))]
        public virtual BookEdition? BookEdition { get; set; }

        [ForeignKey(nameof(ShelfId))]
        public virtual Shelf? Shelf { get; set; }

        public ICollection<PhysicalCopy> PhysicalCopies { get; set; } = new List<PhysicalCopy>();

        // Future collections (commented out)
         public ICollection<BorrowingRecord> BorrowingRecords { get; set; }
        
    }
}
