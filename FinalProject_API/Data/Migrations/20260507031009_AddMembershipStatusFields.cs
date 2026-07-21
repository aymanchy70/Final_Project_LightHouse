using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipStatusFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PhysicalCopyId1",
                table: "PhysicalCopies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MembershipStatus",
                table: "Members",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "Members",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalCopies_PhysicalCopyId1",
                table: "PhysicalCopies",
                column: "PhysicalCopyId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PhysicalCopies_PhysicalCopies_PhysicalCopyId1",
                table: "PhysicalCopies",
                column: "PhysicalCopyId1",
                principalTable: "PhysicalCopies",
                principalColumn: "PhysicalCopyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhysicalCopies_PhysicalCopies_PhysicalCopyId1",
                table: "PhysicalCopies");

            migrationBuilder.DropIndex(
                name: "IX_PhysicalCopies_PhysicalCopyId1",
                table: "PhysicalCopies");

            migrationBuilder.DropColumn(
                name: "PhysicalCopyId1",
                table: "PhysicalCopies");

            migrationBuilder.DropColumn(
                name: "MembershipStatus",
                table: "Members");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Members");
        }
    }
}
