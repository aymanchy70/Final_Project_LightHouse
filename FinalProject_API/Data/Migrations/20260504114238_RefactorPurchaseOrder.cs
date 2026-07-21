using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactorPurchaseOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Supplier",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "Supplier",
                table: "PhysicalCopies");

            migrationBuilder.RenameColumn(
                name: "ReceivedDate",
                table: "PurchaseOrders",
                newName: "ApprovedDate");

            migrationBuilder.AddColumn<string>(
                name: "PO_Number",
                table: "PurchaseOrders",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "PurchaseOrders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReceivedQuantity",
                table: "PurchaseOrderItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SupplierId",
                table: "PhysicalCopies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_PO_Number",
                table: "PurchaseOrders",
                column: "PO_Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_SupplierId",
                table: "PurchaseOrders",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalCopies_SupplierId",
                table: "PhysicalCopies",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_PhysicalCopies_Suppliers_SupplierId",
                table: "PhysicalCopies",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "SupplierId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_Suppliers_SupplierId",
                table: "PurchaseOrders",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "SupplierId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhysicalCopies_Suppliers_SupplierId",
                table: "PhysicalCopies");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_Suppliers_SupplierId",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_PO_Number",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_SupplierId",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PhysicalCopies_SupplierId",
                table: "PhysicalCopies");

            migrationBuilder.DropColumn(
                name: "PO_Number",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "ReceivedQuantity",
                table: "PurchaseOrderItems");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                table: "PhysicalCopies");

            migrationBuilder.RenameColumn(
                name: "ApprovedDate",
                table: "PurchaseOrders",
                newName: "ReceivedDate");

            migrationBuilder.AddColumn<string>(
                name: "Supplier",
                table: "PurchaseOrders",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Supplier",
                table: "PhysicalCopies",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
