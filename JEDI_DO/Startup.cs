using JEDI_DO.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace JEDI_DO
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            switch (DBType.MSSQL)
            {
                case DBType.InMemory:
                    // InMemory
                    services.AddDbContext<JediDoContext>(options => options.UseInMemoryDatabase("JediTodoList"));
                    break;

                case DBType.MSSQL:
                    // SQL DB
                    // To Enable 
                    // 1. set case enum: DBType.MSSQL
                    // 3. Create the database on  (localdb) - name it: JediDo
                    // 4. Run Migrations or the JediDo_InitialCreate.sql script in the Migrations Folder
                    services.AddDbContext<JediDoContext>(options =>
                            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnectionSQL")));
                    break;

                case DBType.SQLITE:
                    services.AddDbContext<JediDoContext>(x => x.UseSqlite(Configuration.GetConnectionString("DefaultConnectionSQLite")));
                    break;
            }

            services.AddControllers();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }

    enum DBType
    {
        InMemory,
        MSSQL,
        SQLITE
    }
}
