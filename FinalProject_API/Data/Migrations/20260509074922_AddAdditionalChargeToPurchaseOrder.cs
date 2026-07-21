using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalChargeToPurchaseOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdditionalCharge",
                table: "PurchaseOrders",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalCharge",
                table: "PurchaseOrders");
        }
    }
}
