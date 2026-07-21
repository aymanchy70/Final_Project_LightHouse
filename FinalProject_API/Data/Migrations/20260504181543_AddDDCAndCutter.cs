using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDDCAndCutter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CutterNumber",
                table: "Books",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DDCNumber",
                table: "Books",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CutterNumber",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "DDCNumber",
                table: "Books");
        }
    }
}
