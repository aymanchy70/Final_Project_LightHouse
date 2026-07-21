using FinalProject_API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinalProject_API.Data
{
    public class AppDbContext: IdentityDbContext<IdentityUser<int>, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<ItemCategory> ItemCategories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Publisher> Publishers { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<BookAuthor> BookAuthors { get; set; }
        public DbSet<BookEdition> BookEditions { get; set; }
        public DbSet<MembershipType> MembershipTypes { get; set; }
        public DbSet<FineRule> FineRules { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Floor> Floors { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Rack> Racks { get; set; }
        public DbSet<Shelf> Shelves { get; set; }
        public DbSet<PhysicalCopy> PhysicalCopies { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<GRN> GRNs { get; set; }
        public DbSet<GRNItem> GRNItems { get; set; }
        public DbSet<BorrowingRecord> BorrowingRecords { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<DigitalCopy> DigitalCopies { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ItemCategory configuration
            modelBuilder.Entity<ItemCategory>(entity =>
            {
                entity.HasKey(e => e.ItemCategoryId);
                entity.Property(e => e.CategoryName)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(e => e.CategoryDescription)
                      .HasMaxLength(250);
            });

            // SubCategory configuration
            modelBuilder.Entity<SubCategory>(entity =>
            {
                entity.HasKey(e => e.SubCategoryId);
                entity.Property(e => e.Name)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(e => e.Description)
                      .HasMaxLength(250);

                // Relationship: ItemCategory has many SubCategories
                entity.HasOne(sc => sc.ItemCategory)
                      .WithMany(c => c.SubCategories)   // No navigation collection on ItemCategory yet (will add later if needed)
                      .HasForeignKey(sc => sc.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict); // Prevent accidental cascade delete
            });

            // Configure BaseEntity properties for all entities that inherit from it
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .Property(nameof(BaseEntity.CreatedDate))
                        .HasDefaultValueSql("GETDATE()");
                }
            }

            // Author configuration
            modelBuilder.Entity<Author>(entity =>
            {
                entity.HasKey(e => e.AuthorId);
                entity.Property(e => e.FullName)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(e => e.Pseudonym)
                      .HasMaxLength(150);
                entity.Property(e => e.Nationality)
                      .HasMaxLength(100);
                entity.Property(e => e.Biography)
                      .HasMaxLength(2000);
                entity.Property(e => e.PhotoUrl)
                      .HasMaxLength(500);
                entity.Property(e => e.Email)
                      .HasMaxLength(100);
            });

            // Publisher configuration
            modelBuilder.Entity<Publisher>(entity =>
            {
                entity.HasKey(e => e.PublisherId);
                entity.Property(e => e.Name)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(e => e.Address)
                      .HasMaxLength(200);
                entity.Property(e => e.Phone)
                      .HasMaxLength(50);
                entity.Property(e => e.Email)
                      .HasMaxLength(100);
                entity.Property(e => e.Website)
                      .HasMaxLength(200);
            });

            // Book configuration
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.BookId);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Subtitle).HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.BaseLibraryCode).HasMaxLength(20);
                entity.Property(e => e.MasterISBN).HasMaxLength(13);
                entity.Property(e => e.Language).HasMaxLength(50);
                entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
                entity.Property(e => e.DDCNumber).HasMaxLength(30);
                entity.Property(e => e.CutterNumber).HasMaxLength(30);

                entity.HasOne(b => b.ItemCategory)
                      .WithMany(c => c.Books)
                      .HasForeignKey(b => b.ItemCategoryId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(b => b.SubCategory)
                       .WithMany(sc => sc.Books)
                      .HasForeignKey(b => b.SubCategoryId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(b => b.Publisher)
                      .WithMany()
                      .HasForeignKey(b => b.PublisherId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // BookAuthor junction configuration
            modelBuilder.Entity<BookAuthor>(entity =>
            {
                entity.HasKey(ba => new { ba.BookId, ba.AuthorId });

                entity.HasOne(ba => ba.Book)
                      .WithMany(b => b.BookAuthors)
                      .HasForeignKey(ba => ba.BookId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ba => ba.Author)
                      .WithMany(a => a.BookAuthors)        // This requires Author.BookAuthors to exist
                      .HasForeignKey(ba => ba.AuthorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<BookEdition>(entity =>
            {
                entity.HasKey(e => e.BookEditionId);
                entity.Property(e => e.Edition).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ISBN).IsRequired().HasMaxLength(13);
                entity.Property(e => e.Language).HasMaxLength(50);
                entity.Property(e => e.PaperType).HasMaxLength(50);
                entity.Property(e => e.CoverType).HasMaxLength(50);
                entity.Property(e => e.CoverImageUrl).HasMaxLength(500);

                entity.HasOne(e => e.Book)
                       .WithMany(b => b.Editions) // No navigation on Book yet, can add later
                      .HasForeignKey(e => e.BookId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Publisher)
                      .WithMany()
                      .HasForeignKey(e => e.PublisherId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<MembershipType>(entity =>
            {
                entity.HasKey(e => e.MembershipTypeId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(250);
                entity.Property(e => e.MaxOutstandingFine).HasColumnType("decimal(10,2)");
            });

            modelBuilder.Entity<FineRule>(entity =>
            {
                entity.HasKey(e => e.FineRuleId);
                entity.Property(e => e.RuleName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.FineType).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<Member>(entity =>
            {
                entity.HasKey(e => e.MemberId);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.BlockReason).HasMaxLength(500);
                entity.Property(e => e.OutstandingFine).HasPrecision(18, 2);
                entity.Property(e => e.MembershipStatus).HasMaxLength(20);
                entity.Property(e => e.PaymentStatus).HasMaxLength(20);

                // One-to-one with IdentityUser (unique UserId)
                entity.HasOne(m => m.IdentityUser)
                      .WithOne()
                      .HasForeignKey<Member>(m => m.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Many-to-one with MembershipType
                entity.HasOne(m => m.MembershipType)
                      .WithMany()
                      .HasForeignKey(m => m.MembershipTypeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Floor>(entity =>
            {
                entity.HasKey(e => e.FloorId);
                entity.Property(e => e.FloorCode).IsRequired().HasMaxLength(10);
                entity.Property(e => e.FloorName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            modelBuilder.Entity<Section>(entity =>
            {
                entity.HasKey(e => e.SectionId);
                entity.Property(e => e.SectionCode).IsRequired().HasMaxLength(20);
                entity.Property(e => e.SectionName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.DDCRangeStart).HasMaxLength(10);
                entity.Property(e => e.DDCRangeEnd).HasMaxLength(10);

                entity.HasOne(s => s.Floor)
                      .WithMany(f => f.Sections)
                      .HasForeignKey(s => s.FloorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Rack>(entity =>
            {
                entity.HasKey(e => e.RackId);
                entity.Property(e => e.RackCode).IsRequired().HasMaxLength(20);
                entity.Property(e => e.RackName).HasMaxLength(150);
                entity.Property(e => e.DDCRangeStart).HasMaxLength(10);
                entity.Property(e => e.DDCRangeEnd).HasMaxLength(10);

                entity.HasOne(r => r.Section)
                      .WithMany(sec => sec.Racks)
                      .HasForeignKey(r => r.SectionId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Shelf>(entity =>
            {
                entity.HasKey(e => e.ShelfId);
                entity.Property(e => e.ShelfCode).IsRequired().HasMaxLength(30);
                entity.Property(e => e.ShelfLabel).HasMaxLength(20);
                entity.Property(e => e.DDCRangeStart).HasMaxLength(10);
                entity.Property(e => e.DDCRangeEnd).HasMaxLength(10);

                entity.HasOne(s => s.Rack)
                      .WithMany(r => r.Shelves)
                      .HasForeignKey(s => s.RackId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PhysicalCopy>(entity =>
            {
                entity.HasKey(e => e.PhysicalCopyId);
                entity.Property(e => e.BaseLibraryCode).HasMaxLength(20);
                entity.Property(e => e.Barcode).HasMaxLength(50);
                entity.Property(e => e.QRCodeData).HasMaxLength(500);
                entity.Property(e => e.QRCodeImageUrl).HasMaxLength(500);
                entity.Property(e => e.RFIDTagId).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.CurrentCondition).HasMaxLength(50);
                entity.Property(e => e.AcquiredCost).HasPrecision(10, 2);
                entity.Property(e => e.PurchaseInvoice).HasMaxLength(50);
                // (no more Supplier string property)

                entity.HasOne(pc => pc.BookEdition)
                        .WithMany(e => e.PhysicalCopies)
                        .HasForeignKey(pc => pc.BookEditionId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pc => pc.Shelf)
                      .WithMany(sh => sh.PhysicalCopies)   // was .WithMany()
                      .HasForeignKey(pc => pc.ShelfId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(pc => pc.Supplier)
                      .WithMany()
                      .HasForeignKey(pc => pc.SupplierId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                entity.HasKey(e => e.PurchaseOrderId);
                entity.Property(e => e.PO_Number)
                      .IsRequired()
                      .HasMaxLength(20);
                entity.HasIndex(e => e.PO_Number).IsUnique();
                entity.Property(e => e.Status)
                      .HasMaxLength(20);
                entity.Property(e => e.Notes)
                      .HasMaxLength(500);

                entity.HasOne(o => o.Supplier)
                      .WithMany()
                      .HasForeignKey(o => o.SupplierId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PurchaseOrderItem>(entity =>
            {
                entity.HasKey(e => e.PurchaseOrderItemId);
                entity.HasOne(i => i.PurchaseOrder)
                      .WithMany(o => o.Items)
                      .HasForeignKey(i => i.PurchaseOrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(i => i.BookEdition)
                      .WithMany()
                      .HasForeignKey(i => i.BookEditionId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.Property(i => i.UnitCost).HasColumnType("decimal(10,2)");
            });


            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasKey(e => e.SupplierId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(300);
            });

            modelBuilder.Entity<GRN>(entity =>
            {
                entity.HasKey(e => e.GRNId);
                entity.Property(e => e.GRN_Number).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.GRN_Number).IsUnique();
                entity.Property(e => e.ReceivedBy).HasMaxLength(100);
                entity.Property(e => e.VehicleNumber).HasMaxLength(50);
                entity.Property(e => e.DeliveryPersonName).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);
            });

            modelBuilder.Entity<GRNItem>(entity =>
            {
                entity.HasKey(e => e.GRNItemId);
                entity.HasOne(i => i.GRN)
                      .WithMany(g => g.Items)
                      .HasForeignKey(i => i.GRNId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(i => i.PurchaseOrderItem)
                      .WithMany()
                      .HasForeignKey(i => i.PurchaseOrderItemId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(i => i.Shelf)
                      .WithMany()
                      .HasForeignKey(i => i.ShelfId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<BorrowingRecord>(entity =>
            {
                entity.HasKey(e => e.BorrowingId);
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.FineAmount).HasColumnType("decimal(10,2)");

                entity.HasOne(br => br.Member)
                       .WithMany(m => m.BorrowingRecords)   // we can add collection later
                      .HasForeignKey(br => br.MemberId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(br => br.PhysicalCopy)
                      .WithMany(pc => pc.BorrowingRecords)
                      .HasForeignKey(br => br.PhysicalCopyId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(br => br.DigitalCopy)
                      .WithMany()
                      .HasForeignKey(br => br.DigitalCopyId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.ReservationId);
                entity.Property(e => e.Status).HasMaxLength(20);

                entity.HasOne(r => r.Member)
                      .WithMany(m => m.Reservations)
                      .HasForeignKey(r => r.MemberId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.BookEdition)
                      .WithMany()
                      .HasForeignKey(r => r.BookEditionId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.PaymentId);
                entity.Property(e => e.Amount).HasColumnType("decimal(10,2)");
                entity.Property(e => e.PaymentMethod).HasMaxLength(50);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.PaymentType).HasMaxLength(50);

                entity.HasOne(p => p.Member)
                       .WithMany(m => m.Payments)
                      .HasForeignKey(p => p.MemberId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DigitalCopy>(entity =>
            {
                entity.HasKey(e => e.DigitalCopyId);
                entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
                entity.Property(e => e.FileFormat).HasMaxLength(10);

                entity.HasOne(dc => dc.BookEdition)
                       .WithMany(be => be.DigitalCopies)
                      .HasForeignKey(dc => dc.BookEditionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Permission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });

                entity.HasOne(rp => rp.Role)
                      .WithMany()
                      .HasForeignKey(rp => rp.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rp => rp.Permission)
                      .WithMany()
                      .HasForeignKey(rp => rp.PermissionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
