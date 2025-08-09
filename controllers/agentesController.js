const agentesRepository = require('../repositories/agentesRepository');
const casosRepository = require('../repositories/casosRepository');
const { z } = require('zod');

function isDataValida(data) {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataInput = new Date(ano, mes - 1, dia);
    
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    return dataInput <= hoje;
}

const agenteSchema = z.object({
  nome: z.string({
    required_error: "O campo 'nome' é obrigatório.",
    invalid_type_error: "O campo 'nome' deve ser uma string.",
  }).min(1, "O campo 'nome' não pode ser vazio."),
  dataDeIncorporacao: z.string().refine(isDataValida, {
    message: "A data de incorporação não pode ser futura.",
  }),
  cargo: z.enum(['investigador', 'delegada', 'escrivao'], {
    required_error: "O campo 'cargo' é obrigatório.",
    invalid_type_error: "O campo 'cargo' deve ser 'investigador', 'delegada' ou 'escrivao'.",
  }),
}).strict();

const agentePatchSchema = agenteSchema.partial();

// GET /agentes
async function listarAgentes(req, res) {
    try {
        const agentes = await agentesRepository.findAll();
        res.status(200).json(agentes);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// GET /agentes/:id
async function buscarAgentePorId(req, res) {
    try {
        const agente = await agentesRepository.findById(req.params.id);
        if (!agente) return res.status(404).json({ message: 'Agente não encontrado.' });
        res.status(200).json(agente);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// POST /agentes
async function criarAgente(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    try {
        const dadosValidados = agenteSchema.parse(req.body);
        const novoAgente = await agentesRepository.create(dadosValidados);
        res.status(201).json(novoAgente);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.issues ? error.issues.map(e => ({ 
                    field: e.path.join('.'), 
                    message: e.message 
                })) : []
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PUT /agentes/:id
async function atualizarAgente(req, res) {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    try {
        const dadosValidados = agenteSchema.parse(req.body);
        
        const agenteAtualizado = await agentesRepository.update(id, dadosValidados);
        if (!agenteAtualizado) {
            return res.status(404).json({ message: 'Agente não encontrado.' });
        }
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.issues ? error.issues.map(e => ({ 
                    field: e.path.join('.'), 
                    message: e.message 
                })) : []
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PATCH /agentes/:id
async function atualizarParcialmenteAgente(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }
    
    try {
        const dadosValidados = agentePatchSchema.parse(req.body);
        const agenteAtualizado = await agentesRepository.update(req.params.id, dadosValidados);
        if (!agenteAtualizado) return res.status(404).json({ message: 'Agente não encontrado.' });
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.issues ? error.issues.map(e => ({ 
                    field: e.path.join('.'), 
                    message: e.message 
                })) : []
            });
        }
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// DELETE /agentes/:id
async function deletarAgente(req, res) {
    try {
        const sucesso = await agentesRepository.remove(req.params.id);
        if (!sucesso) return res.status(404).json({ message: 'Agente não encontrado.' });
        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// BÔNUS: GET /agentes/:id/casos
async function listarCasosDoAgente(req, res) {
    try {
        const agente = await agentesRepository.findById(req.params.id);
        if (!agente) return res.status(404).json({ message: 'Agente não encontrado.' });
        
        const casos = await casosRepository.findByAgenteId(req.params.id);
        res.status(200).json(casos);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

module.exports = {
    listarAgentes,
    buscarAgentePorId,
    criarAgente,
    atualizarAgente,
    atualizarParcialmenteAgente,
    deletarAgente,
    listarCasosDoAgente 
};