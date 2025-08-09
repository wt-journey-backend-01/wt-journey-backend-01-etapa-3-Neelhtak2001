/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('casos').del()
  
  // Inserts seed entries
  await knex('casos').insert([
    {
      titulo: 'Roubo na Padaria Central',
      descricao: 'Investigação sobre furto de equipamentos na padaria',
      status: 'aberto',
      agente_id: 1
    },
    {
      titulo: 'Vandalismo no Parque Municipal', 
      descricao: 'Danos ao patrimônio público no parque',
      status: 'solucionado',
      agente_id: 2
    }
  ]);
};