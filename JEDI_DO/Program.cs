using JEDI_DO.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace JEDI_DO
{
    public class Program
    {
        public static void Main(string[] args)
        {
                var host = CreateHostBuilder(args).Build();
            using ( var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try {
                    // get datacontext 
                    var context = services.GetRequiredService<JediDoContext>();
                    // apply existing migrations 
                    context.Database.Migrate();
                    Seed.SeedToDo(context);
                }
                catch (Exception ex) {
                    // todo: create a logger 
                    Console.WriteLine(ex);
                }
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
