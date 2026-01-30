using System.Security.Claims;
using JEDI_DO.Data;
using JEDI_DO.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Shared.Factories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<JediDoContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IItemToDTOFactory, ItemToDTOFactory>();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login/";
        options.Cookie.Name = "JediDo.Auth";
        options.Cookie.SameSite = SameSiteMode.Strict;
    });
builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<JediDoContext>();
        context.Database.Migrate();
        Seed.SeedToDo(context, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred applying migrations or seeding the database");
        throw;
    }
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
