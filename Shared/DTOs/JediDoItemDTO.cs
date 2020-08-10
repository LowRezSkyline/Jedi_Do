using JEDI_DO.Models;
using System.ComponentModel;

namespace Shared.DTOs
{
    public class JediDoItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string JediDoType { get; set; }
        public int JediDoTypeId { get; set; }         
        public bool Completed { get; set; }
    }
}
