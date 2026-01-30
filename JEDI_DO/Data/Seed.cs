using JEDI_DO.Models;
using Microsoft.Extensions.Logging;
using Shared.Entities;

namespace JEDI_DO.Data;

public static class Seed
{
    public static void SeedToDo(JediDoContext context, ILogger logger)
    {
        int lukeId, vaderId;

        if (!context.User.Any())
        {
            logger.LogInformation("Seeding users and JediDo items");
            var (lukeHash, lukeSalt) = PasswordHelper.HashPassword("MayTheForceBeWithYou");
            var (vaderHash, vaderSalt) = PasswordHelper.HashPassword("THEDARKSIDE");

            var luke = new User { UserName = "Luke", PasswordHash = lukeHash, Salt = lukeSalt };
            var vader = new User { UserName = "Vader", PasswordHash = vaderHash, Salt = vaderSalt };
            context.User.Add(luke);
            context.User.Add(vader);
            context.SaveChanges();
            lukeId = luke.Id;
            vaderId = vader.Id;
        }
        else
        {
            var luke = context.User.FirstOrDefault(u => u.UserName == "Luke");
            var vader = context.User.FirstOrDefault(u => u.UserName == "Vader");
            if (luke == null || vader == null)
                return;
            lukeId = luke.Id;
            vaderId = vader.Id;
        }

        // Blow away existing items so we always get the exact preseeded list (dev-friendly)
        if (context.JediDoItem.Any())
        {
            logger.LogInformation("Clearing existing JediDo items and reseeding.");
            context.JediDoItem.RemoveRange(context.JediDoItem);
            context.SaveChanges();
        }

        logger.LogInformation("Seeding JediDo items for Luke and Vader");

        var lukeItems = new[]
        {
            new JediDoItem { UserId = lukeId, Name = "Find that crazy Wizard", JediDoTypeId = 1, Completed = false },
            new JediDoItem { UserId = lukeId, Name = "Shoot some womp rats", JediDoTypeId = 1, Completed = false },
            new JediDoItem { UserId = lukeId, Name = "Find the missing droid.", JediDoTypeId = 1, Completed = false }
        };
        var vaderItems = new[]
        {
            new JediDoItem { UserId = vaderId, Name = "Complete deathstar", JediDoTypeId = 1, Completed = false },
            new JediDoItem { UserId = vaderId, Name = "Talk to Emperor about troops not respecting my power!", JediDoTypeId = 1, Completed = false },
            new JediDoItem { UserId = vaderId, Name = "Find a date for Lando's birthday party", JediDoTypeId = 1, Completed = false },
            new JediDoItem { UserId = vaderId, Name = "Not Do! Tell Emperor plan to rule galaxy with offspring.", JediDoTypeId = 2, Completed = false }
        };

        context.JediDoItem.AddRange(lukeItems);
        context.JediDoItem.AddRange(vaderItems);
        context.SaveChanges();
    }
}
