const db = require('../db/db');

const agentesRepository = {
    // GET /agentes
    findAll() {
        return db('agentes').select('*');
    },

    // GET /agentes/:id
    findById(id) {
        return db('agentes').where({ id }).first();
    },

    // POST /agentes
    async create(agente) {
        const [novoAgente] = await db('agentes').insert(agente).returning('*');
        return novoAgente;
    },

    // PUT /agentes/:id
    async update(id, agente) {
        const [agenteAtualizado] = await db('agentes')
            .where({ id })
            .update(agente)
            .returning('*');
        return agenteAtualizado;
    },

    // DELETE /agentes/:id
    async remove(id) {
        const deletedCount = await db('agentes').where({ id }).del();
        return deletedCount > 0;
    }
};

module.exports = agentesRepository;