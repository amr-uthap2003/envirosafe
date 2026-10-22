using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnviroSafe.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmittedByRoleToReading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubmittedByRole",
                table: "EnvironmentalReadings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmittedByRole",
                table: "EnvironmentalReadings");
        }
    }
}
