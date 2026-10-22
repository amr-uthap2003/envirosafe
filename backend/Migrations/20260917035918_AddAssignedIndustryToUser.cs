using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnviroSafe.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedIndustryToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedIndustryId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_AssignedIndustryId",
                table: "Users",
                column: "AssignedIndustryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Industries_AssignedIndustryId",
                table: "Users",
                column: "AssignedIndustryId",
                principalTable: "Industries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Industries_AssignedIndustryId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_AssignedIndustryId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AssignedIndustryId",
                table: "Users");
        }
    }
}
