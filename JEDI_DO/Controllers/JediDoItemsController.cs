using System.Security.Claims;
using JEDI_DO.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs;
using Shared.Entities;
using Shared.Factories;

namespace JEDI_DO.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class JediDoItemsController(
    JediDoContext context,
    IItemToDTOFactory toDtoFactory) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JediDoItemDTO>>> GetTodoItems(CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        var items = await context.JediDoItem
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);
        return items.Select(x => toDtoFactory.Create(x)!).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<JediDoItemDTO>> GetTodoItem(int id, CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        var item = await context.JediDoItem
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, cancellationToken);
        if (item == null)
            return NotFound();

        var dto = toDtoFactory.Create(item);
        if (dto is null)
            return NotFound();
        return dto;
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTodoItem(int id, JediDoItemDTO todoItemDTO, CancellationToken cancellationToken = default)
    {
        if (id != todoItemDTO.Id)
            return BadRequest();

        var userId = CurrentUserId;
        var item = await context.JediDoItem
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, cancellationToken);
        if (item == null)
            return NotFound();

        item.Name = todoItemDTO.Name;
        item.JediDoTypeId = todoItemDTO.JediDoTypeId;
        item.Completed = todoItemDTO.Completed;

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await TodoItemExists(id, userId, cancellationToken))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<JediDoItemDTO>> CreateTodoItem(JediDoItemDTO todoItemDTO, CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        var item = new JediDoItem
        {
            UserId = userId,
            Name = todoItemDTO.Name,
            JediDoTypeId = todoItemDTO.JediDoTypeId,
            Completed = todoItemDTO.Completed
        };

        context.JediDoItem.Add(item);
        await context.SaveChangesAsync(cancellationToken);

        var dto = toDtoFactory.Create(item);
        return CreatedAtAction(nameof(GetTodoItem), new { id = item.Id }, dto);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTodoItem(int id, CancellationToken cancellationToken = default)
    {
        var userId = CurrentUserId;
        var item = await context.JediDoItem
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, cancellationToken);
        if (item == null)
            return NotFound();

        context.JediDoItem.Remove(item);
        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<bool> TodoItemExists(int id, int userId, CancellationToken cancellationToken) =>
        await context.JediDoItem.AnyAsync(e => e.Id == id && e.UserId == userId, cancellationToken);
}
