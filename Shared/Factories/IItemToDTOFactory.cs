using Shared.DTOs;
using Shared.Entities;

namespace Shared.Factories;

public interface IItemToDTOFactory
{
    JediDoItemDTO? Create(JediDoItem? item);
}
