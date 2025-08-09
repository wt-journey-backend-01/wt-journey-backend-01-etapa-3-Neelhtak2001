const db = require('../db/db');

async function findAll() {
  return await db('casos').select('*');
}

async function findById(id) {
  return await db('casos').where({ id }).first();
}

async function create(caso) {
  const [novoCaso] = await db('casos').insert(caso).returning('*');
  return novoCaso;
}

async function update(id, dados) {
  const [casoAtualizado] = await db('casos').where({ id }).update(dados).returning('*');
  return casoAtualizado;
}

async function remove(id) {
  const linhasExcluidas = await db('casos').where({ id }).del();
  return linhasExcluidas > 0;
}

async function findByAgenteId(agente_id) {
  return await db('casos').where({ agente_id }).select('*');
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByAgenteId,
};