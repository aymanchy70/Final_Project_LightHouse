using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIconAddReceiveDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Icon",
                table: "ItemCategories");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReceiveDate",
                table: "PurchaseOrders",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceiveDate",
                table: "PurchaseOrders");

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "ItemCategories",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);
        }
    }
}
