namespace Shared.Entities;

public class JediDoItem
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public required string Name { get; set; }

    public int? JediDoTypeId { get; set; }

    public bool Completed { get; set; }

    public string JediType => JediDoTypeId.HasValue ? GetJediDoType(JediDoTypeId.Value) : "N/A";

    private static string GetJediDoType(int typeId) => typeId == 1 ? "Do!" : "Not Do!";
}
