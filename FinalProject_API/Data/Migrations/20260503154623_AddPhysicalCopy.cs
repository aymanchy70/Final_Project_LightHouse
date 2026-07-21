using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPhysicalCopy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PhysicalCopies",
                columns: table => new
                {
                    PhysicalCopyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookEditionId = table.Column<int>(type: "int", nullable: false),
                    BaseLibraryCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CopySerialNumber = table.Column<int>(type: "int", nullable: false),
                    Barcode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ShelfId = table.Column<int>(type: "int", nullable: true),
                    PositionOnShelf = table.Column<int>(type: "int", nullable: true),
                    QRCodeData = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    QRCodeImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RFIDTagId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    HasRFID = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CurrentCondition = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AcquiredDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcquiredCost = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Supplier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PurchaseInvoice = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LastInventoryCheck = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckedOutCount = table.Column<int>(type: "int", nullable: false),
                    IsReference = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhysicalCopies", x => x.PhysicalCopyId);
                    table.ForeignKey(
                        name: "FK_PhysicalCopies_BookEditions_BookEditionId",
                        column: x => x.BookEditionId,
                        principalTable: "BookEditions",
                        principalColumn: "BookEditionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhysicalCopies_Shelves_ShelfId",
                        column: x => x.ShelfId,
                        principalTable: "Shelves",
                        principalColumn: "ShelfId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalCopies_BookEditionId",
                table: "PhysicalCopies",
                column: "BookEditionId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalCopies_ShelfId",
                table: "PhysicalCopies",
                column: "ShelfId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhysicalCopies");
        }
    }
}
