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
  agente_id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive("O 'agente_id' deve ser um número inteiro positivo."))
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
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    try {
        const dadosValidados = casoSchema.parse(req.body);
        
        const agenteExiste = await agentesRepository.findById(dadosValidados.agente_id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }

        const novoCaso = await casosRepository.create(dadosValidados);
        res.status(201).json(novoCaso);
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

// PUT /casos/:id
async function atualizarCaso(req, res) {
    const { id } = req.params;
    
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    try {
        const dadosValidados = casoSchema.parse(req.body);

        const agenteExiste = await agentesRepository.findById(dadosValidados.agente_id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }

        const casoAtualizado = await casosRepository.update(id, dadosValidados);
        if (!casoAtualizado) {
            return res.status(404).json({ message: 'Caso não encontrado.' });
        }
        res.status(200).json(casoAtualizado);
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

// PATCH /casos/:id
async function atualizarParcialmenteCaso(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }
    
    try {
        const dadosValidados = casoPatchSchema.parse(req.body);
        if (dadosValidados.agente_id) {
            const agenteExiste = await agentesRepository.findById(dadosValidados.agente_id);
            if (!agenteExiste) return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }
        const casoAtualizado = await casosRepository.update(req.params.id, dadosValidados);
        if (!casoAtualizado) return res.status(404).json({ message: 'Caso não encontrado.' });
        res.status(200).json(casoAtualizado);
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

// DELETE /casos/:id
async function deletarCaso(req, res) {
    try {
        const sucesso = await casosRepository.remove(req.params.id);
        if (!sucesso) return res.status(404).json({ message: 'Caso não encontrado.' });
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
    listarCasos,
    buscarCasoPorId,
    criarCaso,
    atualizarCaso,
    atualizarParcialmenteCaso,
    deletarCaso,
    listarCasosDoAgente // BÔNUS
};