using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDigitalBorrowing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DigitalCopyId",
                table: "BorrowingRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDigital",
                table: "BorrowingRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_BorrowingRecords_DigitalCopyId",
                table: "BorrowingRecords",
                column: "DigitalCopyId");

            migrationBuilder.AddForeignKey(
                name: "FK_BorrowingRecords_DigitalCopies_DigitalCopyId",
                table: "BorrowingRecords",
                column: "DigitalCopyId",
                principalTable: "DigitalCopies",
                principalColumn: "DigitalCopyId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BorrowingRecords_DigitalCopies_DigitalCopyId",
                table: "BorrowingRecords");

            migrationBuilder.DropIndex(
                name: "IX_BorrowingRecords_DigitalCopyId",
                table: "BorrowingRecords");

            migrationBuilder.DropColumn(
                name: "DigitalCopyId",
                table: "BorrowingRecords");

            migrationBuilder.DropColumn(
                name: "IsDigital",
                table: "BorrowingRecords");
        }
    }
}
