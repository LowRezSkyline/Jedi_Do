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
        public string Secret { get; set; }

        private string GetJediDoType(int typeId)
        {                
            var _ret = "NA";
            switch (typeId)
            {

                case 1:
                    _ret = "DO!";
                break;

                case 2:
                    _ret = "Do Not Do!";
                    break;
            }
            return _ret; //  (typeId == 1) ? "Do!" : "Do Not Do!";
        }

    }
}
