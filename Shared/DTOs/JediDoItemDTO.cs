using JEDI_DO.Models;
using System.ComponentModel;

namespace Shared.DTOs
{
    public class JediDoItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public virtual JediDoType JediDoType { get; set; }
        [DisplayName("Type")]
        public int JediDoTypeId { get; set; }
        public bool Completed { get; set; }
    }
}
