using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinalProject_API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddYearlyFeeToMembershipType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "YearlyFee",
                table: "MembershipTypes",
                type: "decimal(10,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "YearlyFee",
                table: "MembershipTypes");
        }
    }
}
