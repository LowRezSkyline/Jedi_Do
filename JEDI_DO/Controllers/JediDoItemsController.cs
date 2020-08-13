using JEDI_DO.Models; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs; 
using Shared.Factories;
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
                .Select(x => new ItemToDTOFactory().Create(x))
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JediDoItemDTO>> GetTodoItem(int id)
        {
            var todoItem = await _context.JediDoItem.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return new ItemToDTOFactory().Create(todoItem);
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
            todoItem.JediDoTypeId = todoItemDTO.JediDoTypeId;
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
                JediDoTypeId = todoItemDTO.JediDoTypeId,
                Name = todoItemDTO.Name
            };

            _context.JediDoItem.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetTodoItem),
                new { id = todoItem.Id },
                 new ItemToDTOFactory().Create(todoItem)
                );
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
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

        private bool TodoItemExists(int id) => _context.JediDoItem.Any(e => e.Id == id);



    }

}

