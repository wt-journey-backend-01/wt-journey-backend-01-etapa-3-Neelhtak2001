const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

const casoSchema = z.object({
  titulo: z.string({
    required_error: "O campo 'titulo' é obrigatório.",
    invalid_type_error: "O campo 'titulo' deve ser uma string.",
  }).min(1, "O campo 'titulo' não pode ser vazio."),
  descricao: z.string({
    required_error: "O campo 'descricao' é obrigatório.",
    invalid_type_error: "O campo 'descricao' deve ser uma string.",
  }).min(1, "O campo 'descricao' não pode ser vazio."),
  status: z.enum(['aberto', 'solucionado'], {
    required_error: "O campo 'status' é obrigatório.",
    invalid_type_error: "O campo 'status' deve ser 'aberto' ou 'solucionado'.",
  }),
  agente_id: z.coerce.number().int().positive("O 'agente_id' deve ser um número inteiro positivo.")
}).strict();

const casoPatchSchema = casoSchema.partial();

// GET /casos
async function listarCasos(req, res) {
    try {
        const casos = await casosRepository.findAll();
        res.status(200).json(casos);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// GET /casos/:id
async function buscarCasoPorId(req, res) {
    try {
        const caso = await casosRepository.findById(req.params.id);
        if (!caso) return res.status(404).json({ message: 'Caso não encontrado.' });
        
        res.status(200).json(caso);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// POST /casos
async function criarCaso(req, res) {
    try {
        const validatedData = casoSchema.parse(req.body);
        
        // Verificar se o agente existe
        const agente = await agentesRepository.findById(validatedData.agente_id);
        if (!agente) return res.status(404).json({ message: 'Agente não encontrado.' });
        
        const novoCaso = await casosRepository.create(validatedData);
        res.status(201).json(novoCaso);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                message: "Payload inválido.",
                errors: error.errors 
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PUT /casos/:id
async function atualizarCaso(req, res) {
    if ('id' in req.body) {
        return res.status(400).json({ message: "O campo 'id' não pode ser alterado." });
    }

    try {
        const validatedData = casoSchema.parse(req.body);
        
        const agente = await agentesRepository.findById(validatedData.agente_id);
        if (!agente) return res.status(404).json({ message: 'Agente não encontrado.' });
        
        const casoAtualizado = await casosRepository.update(req.params.id, validatedData);
        if (!casoAtualizado) return res.status(404).json({ message: 'Caso não encontrado.' });
        
        res.status(200).json(casoAtualizado);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                message: "Payload inválido.",
                errors: error.errors 
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PATCH /casos/:id
async function atualizarParcialmenteCaso(req, res) {
    if ('id' in req.body) {
        return res.status(400).json({ message: "O campo 'id' não pode ser alterado." });
    }

    try {
        const validatedData = casoPatchSchema.parse(req.body);
        
        if (validatedData.agente_id) {
            const agente = await agentesRepository.findById(validatedData.agente_id);
            if (!agente) return res.status(404).json({ message: 'Agente não encontrado.' });
        }
        
        const casoAtualizado = await casosRepository.update(req.params.id, validatedData);
        if (!casoAtualizado) return res.status(404).json({ message: 'Caso não encontrado.' });
        
        res.status(200).json(casoAtualizado);
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                message: "Payload inválido.",
                errors: error.errors 
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// DELETE /casos/:id
async function deletarCaso(req, res) {
    try {
        const removido = await casosRepository.remove(req.params.id);
        if (!removido) return res.status(404).json({ message: 'Caso não encontrado.' });
        
        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

module.exports = {
    listarCasos,
    buscarCasoPorId,
    criarCaso,
    atualizarCaso,
    atualizarParcialmenteCaso,
    deletarCaso,
};