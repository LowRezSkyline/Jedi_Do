using JEDI_DO.Models;
using Shared.DTOs;

namespace Shared.Factories
{
    public class ItemToDTOFactory : IItemToDTOFactory
    { 
        public JediDoItemDTO Create(JediDoItem item)
        {
            if(item == null)
            {
                return null;
            }

            return  new JediDoItemDTO
            {
                Id = item.Id,
                Name = item.Name,
                JediDoTypeId = (item.JediDoTypeId.HasValue) ? item.JediDoTypeId.Value : 0,
                JediDoType = item.JediType,
                Completed = item.Completed
        };

        }
    }
}
