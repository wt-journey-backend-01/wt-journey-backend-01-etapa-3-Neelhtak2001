# Instruções de Execução

## Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+

## Configuração

### 1. Subir o banco com Docker
```bash
docker-compose up -d
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar migrations
```bash
npx knex migrate:latest
```

### 4. Rodar seeds
```bash
npx knex seed:run
```

### 5. Iniciar aplicação
```bash
npm start
```

A API estará disponível em `http://localhost:3000`

## Endpoints Disponíveis

### Agentes
- `GET /agentes` - Listar todos os agentes
- `GET /agentes/:id` - Buscar agente por ID
- `POST /agentes` - Criar novo agente
- `PUT /agentes/:id` - Atualizar agente completo
- `PATCH /agentes/:id` - Atualizar agente parcialmente
- `DELETE /agentes/:id` - Deletar agente
- `GET /agentes/:id/casos` - Listar casos do agente (BÔNUS)

### Casos
- `GET /casos` - Listar todos os casos
- `GET /casos/:id` - Buscar caso por ID
- `POST /casos` - Criar novo caso
- `PUT /casos/:id` - Atualizar caso completo
- `PATCH /casos/:id` - Atualizar caso parcialmente
- `DELETE /casos/:id` - Deletar caso