using System.Linq;
using JEDI_DO.Models;
using Shared.DTOs;
using System.Text;

namespace Shared.DTOs
{
    public class TODO
    {
        public int userId { get; set; } 
        public int id { get; set; }
        public string title { get; set; }
        public bool completed { get; set; }
    
    }
    public class Seed
    {
      
        public static void SeedToDo(JediDoContext context)
        {
            // if db is empty add some data!
            if(!context.JediDoItem.Any())
            {
                // add data 
                var todoItem = new JediDoItem
                {
                    Completed = false,
                    JediDoTypeId = 1,
                    Name = "These are not the drooids you are looking for"
                };
            // add to dbcontet 
            context.JediDoItem.Add(todoItem); 
            // save changes 
            context.SaveChanges();
            }
        }
    }
}