using JEDI_DO.Data;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JEDI_DO.Migrations;

/// <inheritdoc />
public partial class AddUserAndAuth : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "User",
            columns: table => new
            {
                Id = table.Column<int>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                UserName = table.Column<string>(type: "TEXT", nullable: false),
                PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                Salt = table.Column<string>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_User", x => x.Id);
            });

        // Insert seed users so UserId=1 exists before we add the FK (deterministic salts for reproducible migrations)
        const string saltLuke = "AAAAAAAAAAAAAAAAAAAAAA==";
        const string saltVader = "AQEBAQEBAQEBAQEBAQEBAQ==";
        var hashLuke = PasswordHelper.HashPasswordWithSalt("MayTheForceBeWithYou", saltLuke);
        var hashVader = PasswordHelper.HashPasswordWithSalt("THEDARKSIDE", saltVader);
        migrationBuilder.Sql($"INSERT INTO \"User\" (UserName, PasswordHash, Salt) VALUES ('Luke', '{hashLuke.Replace("'", "''")}', '{saltLuke}'), ('Vader', '{hashVader.Replace("'", "''")}', '{saltVader}');");

        migrationBuilder.AddColumn<int>(
            name: "UserId",
            table: "JediDoItem",
            type: "INTEGER",
            nullable: false,
            defaultValue: 1);

        // SQLite: adding FK requires table rebuild; PRAGMA must run outside a transaction
        migrationBuilder.Sql("""
            PRAGMA foreign_keys = 0;
            CREATE TABLE "ef_temp_JediDoItem" (
                "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "Name" TEXT NOT NULL,
                "JediDoTypeId" INTEGER NULL,
                "Completed" INTEGER NOT NULL,
                "UserId" INTEGER NOT NULL,
                CONSTRAINT "FK_JediDoItem_User_UserId" FOREIGN KEY ("UserId") REFERENCES "User" ("Id") ON DELETE CASCADE
            );
            INSERT INTO "ef_temp_JediDoItem" ("Id", "Name", "JediDoTypeId", "Completed", "UserId")
            SELECT "Id", "Name", "JediDoTypeId", "Completed", "UserId" FROM "JediDoItem";
            DROP TABLE "JediDoItem";
            ALTER TABLE "ef_temp_JediDoItem" RENAME TO "JediDoItem";
            CREATE INDEX "IX_JediDoItem_UserId" ON "JediDoItem" ("UserId");
            PRAGMA foreign_keys = 1;
            """, suppressTransaction: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // SQLite: remove FK and UserId column via table rebuild (outside transaction)
        migrationBuilder.Sql("""
            PRAGMA foreign_keys = 0;
            CREATE TABLE "ef_temp_JediDoItem" (
                "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "Name" TEXT NOT NULL,
                "JediDoTypeId" INTEGER NULL,
                "Completed" INTEGER NOT NULL
            );
            INSERT INTO "ef_temp_JediDoItem" ("Id", "Name", "JediDoTypeId", "Completed")
            SELECT "Id", "Name", "JediDoTypeId", "Completed" FROM "JediDoItem";
            DROP TABLE "JediDoItem";
            ALTER TABLE "ef_temp_JediDoItem" RENAME TO "JediDoItem";
            PRAGMA foreign_keys = 1;
            """, suppressTransaction: true);

        migrationBuilder.DropTable(
            name: "User");
    }
}
