const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Erro do Zod
    if (err.name === 'ZodError') {
        return res.status(400).json({
            message: "Payload inválido.",
            errors: err.issues.map(e => ({ 
                field: e.path.join('.'), 
                message: e.message 
            }))
        });
    }

    // Erro de banco de dados
    if (err.code === '23503') { // Foreign key constraint
        return res.status(400).json({ 
            message: "Referência inválida no banco de dados." 
        });
    }

    if (err.code === '23505') { // Unique constraint
        return res.status(400).json({ 
            message: "Valor duplicado não permitido." 
        });
    }

    // Erro genérico
    res.status(500).json({ 
        message: "Erro interno do servidor." 
    });
};

module.exports = errorHandler;