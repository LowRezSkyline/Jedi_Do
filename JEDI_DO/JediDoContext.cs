using Microsoft.EntityFrameworkCore;

namespace JEDI_DO.Models
{
    public class JediDoContext : DbContext
    {
        public JediDoContext(DbContextOptions<JediDoContext> options)
            : base(options)
        {
        }

        public DbSet<JediDoItem> JediDoItem { get; set; }
        public DbSet<JediDoType> JediDoType { get; set; }

    }
}
