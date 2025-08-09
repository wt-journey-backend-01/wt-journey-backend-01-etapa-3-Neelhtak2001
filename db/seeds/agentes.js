/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('agentes').del()
  
  // Inserts seed entries
  await knex('agentes').insert([
    {
      nome: 'João Silva',
      dataDeIncorporacao: '2020-01-15',
      cargo: 'investigador' // ← minúscula
    },
    {
      nome: 'Maria Santos',
      dataDeIncorporacao: '2019-03-22', 
      cargo: 'delegada' // ← minúscula
    }
  ]);
};