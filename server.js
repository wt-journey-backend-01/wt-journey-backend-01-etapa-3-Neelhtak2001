require('dotenv').config();
const express = require('express');

const agentesRoutes = require('./routes/agentesRoutes');
const casosRoutes = require('./routes/casosRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/agentes', agentesRoutes);
app.use('/casos', casosRoutes);

// Documentação simples
app.get('/docs', (req, res) => {
    res.json({
        message: "API do Departamento de Polícia",
        endpoints: {
            agentes: "/agentes",
            casos: "/casos"
        }
    });
});

app.get('/', (req, res) => {
    res.json({ message: "Servidor do Departamento de Polícia funcionando!" });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
    console.log(`Documentação disponível em http://localhost:${PORT}/docs`);
});

module.exports = app;