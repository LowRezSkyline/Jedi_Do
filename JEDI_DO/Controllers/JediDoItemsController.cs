using JEDI_DO.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JEDI_DO.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JediDoItemsController : ControllerBase
    {
        private readonly JediDoContext _context;

        public JediDoItemsController(JediDoContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JediDoItemDTO>>> GetTodoItems()
        {
            return await _context.JediDoItem
                .Select(x => ItemToDTO(x))
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JediDoItemDTO>> GetTodoItem(long id)
        {
            var todoItem = await _context.JediDoItem.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return ItemToDTO(todoItem);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodoItem(int id, JediDoItemDTO todoItemDTO)
        {
            if (id != todoItemDTO.Id)
            {
                return BadRequest();
            }

            var todoItem = await _context.JediDoItem.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            todoItem.Name = todoItemDTO.Name;
            todoItem.Completed = todoItemDTO.Completed;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!TodoItemExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<JediDoItemDTO>> CreateTodoItem(JediDoItemDTO todoItemDTO)
        {
            var todoItem = new JediDoItem
            {
                Completed = todoItemDTO.Completed,
                Name = todoItemDTO.Name
            };

            _context.JediDoItem.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetTodoItem),
                new { id = todoItem.Id },
                ItemToDTO(todoItem));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(long id)
        {
            var todoItem = await _context.JediDoItem.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            _context.JediDoItem.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(long id) =>
             _context.JediDoItem.Any(e => e.Id == id);

        private static JediDoItemDTO ItemToDTO(JediDoItem todoItem) =>
            new JediDoItemDTO
            {
                Id = todoItem.Id,
                Name = todoItem.Name,
                Completed = todoItem.Completed
            };
    }

}

