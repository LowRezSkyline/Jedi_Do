using Microsoft.EntityFrameworkCore;
using Shared.Entities;

namespace JEDI_DO.Models;

public class JediDoContext(DbContextOptions<JediDoContext> options) : DbContext(options)
{
    public DbSet<User> User { get; set; }
    public DbSet<JediDoItem> JediDoItem { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JediDoItem>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
