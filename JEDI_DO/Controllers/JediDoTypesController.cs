using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JEDI_DO.Models;

namespace JEDI_DO.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JediDoTypesController : ControllerBase
    {
        private readonly JediDoContext _context;

        public JediDoTypesController(JediDoContext context)
        {
            _context = context;
        }

        // GET: api/JediDoTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JediDoType>>> GetJediDoType()
        {
            return await _context.JediDoType.ToListAsync();
        }

        // GET: api/JediDoTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<JediDoType>> GetJediDoType(int id)
        {
            var jediDoType = await _context.JediDoType.FindAsync(id);

            if (jediDoType == null)
            {
                return NotFound();
            }

            return jediDoType;
        }

        // PUT: api/JediDoTypes/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJediDoType(int id, JediDoType jediDoType)
        {
            if (id != jediDoType.Id)
            {
                return BadRequest();
            }

            _context.Entry(jediDoType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JediDoTypeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/JediDoTypes
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<JediDoType>> PostJediDoType(JediDoType jediDoType)
        {
            _context.JediDoType.Add(jediDoType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetJediDoType", new { id = jediDoType.Id }, jediDoType);
        }

        // DELETE: api/JediDoTypes/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<JediDoType>> DeleteJediDoType(int id)
        {
            var jediDoType = await _context.JediDoType.FindAsync(id);
            if (jediDoType == null)
            {
                return NotFound();
            }

            _context.JediDoType.Remove(jediDoType);
            await _context.SaveChangesAsync();

            return jediDoType;
        }

        private bool JediDoTypeExists(int id)
        {
            return _context.JediDoType.Any(e => e.Id == id);
        }
    }
}
