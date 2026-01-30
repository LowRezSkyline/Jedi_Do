using Shared.DTOs;
using Shared.Entities;

namespace Shared.Factories;

public class ItemToDTOFactory : IItemToDTOFactory
{
    public JediDoItemDTO? Create(JediDoItem? item)
    {
        if (item == null)
            return null;

        return new JediDoItemDTO
        {
            Id = item.Id,
            Name = item.Name,
            JediDoTypeId = item.JediDoTypeId ?? 0,
            JediDoType = item.JediType,
            Completed = item.Completed
        };
    }
}
