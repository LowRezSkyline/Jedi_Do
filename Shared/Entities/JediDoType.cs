using System.ComponentModel.DataAnnotations;

namespace JEDI_DO.Models
{
    public class JediDoType
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
    }
}
