using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace JEDI_DO.Models
{
    public class JediDoItem
    {
        public int Id { get; set; }
      
        public string Name { get; set; }
        
        public virtual JediDoType JediDoType { get; set; }
        [DisplayName("Type")]
        public int JediDoTypeId { get; set; }
        
        public bool Completed { get; set; }
        public string Secret { get; set; }
    }
}
