namespace JEDI_DO.Models;

public class User
{
    public int Id { get; set; }
    public required string UserName { get; set; }
    public required string PasswordHash { get; set; }
    public required string Salt { get; set; }
}
