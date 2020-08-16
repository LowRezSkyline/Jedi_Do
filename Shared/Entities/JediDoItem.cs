using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace JEDI_DO.Models
{
    public class JediDoItem
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int? JediDoTypeId { get; set; }
        public string JediType { get { return (JediDoTypeId.HasValue) ? GetJediDoType(JediDoTypeId.Value) : "N/A"; } }

        public bool Completed { get; set; }

        private string GetJediDoType(int typeId)  =>  (typeId == 1) ? "Do!" : "Not Do!";

    }
}
