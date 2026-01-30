namespace Shared.DTOs;

public class JediDoItemDTO
{
    public int Id { get; set; }
    public required string Name { get; set; }
    /// <summary>Display only; not sent by client on create/update. Server sets from entity.</summary>
    public string? JediDoType { get; set; }
    public int JediDoTypeId { get; set; }
    public bool Completed { get; set; }
}
