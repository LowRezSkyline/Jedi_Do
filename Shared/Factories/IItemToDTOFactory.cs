using JEDI_DO.Models;
using Shared.DTOs;

namespace Shared.Factories
{
    public interface IItemToDTOFactory
    {
        JediDoItemDTO Create(JediDoItem item);
    }
}
