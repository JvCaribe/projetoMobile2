# Finanza — Backend (API REST)

API do app **Finanza** feita com **Node.js + Express + MySQL**.
Ela substitui os dados de exemplo que hoje ficam em `projetomobile/src/data/transacoes.ts`.

## Tecnologias

| Pacote         | Para que serve                                                   |
|----------------|------------------------------------------------------------------|
| `express`      | Cria o servidor e as rotas da API                                |
| `mysql2`       | Conecta e faz consultas no MySQL                                 |
| `bcryptjs`     | Gera o hash das senhas (a senha nunca é salva em texto puro)     |
| `jsonwebtoken` | Gera e confere o token JWT do login                              |
| `cors`         | Libera o app Ionic (outra porta) para chamar a API               |
| `dotenv`       | Lê as configurações do arquivo `.env`                            |

## Estrutura de pastas

```
backend/
├── sql/
│   └── banco.sql              # Cria o banco, as tabelas e as categorias padrão
├── src/
│   ├── server.js              # Ponto de entrada: configura o Express e liga o servidor
│   ├── config/
│   │   └── db.js              # Conexão com o MySQL
│   ├── middleware/
│   │   └── autenticacao.js    # Confere o token JWT nas rotas protegidas
│   └── routes/
│       ├── auth.routes.js       # Cadastro e login
│       ├── usuario.routes.js    # Perfil do usuário logado
│       ├── categorias.routes.js # Lista de categorias
│       ├── transacoes.routes.js # CRUD de transações
│       └── resumo.routes.js     # Totais do Dashboard
├── testes.http                # Exemplos para testar as rotas
├── .env.example               # Modelo das configurações
└── package.json
```

**Fluxo de uma requisição:** app → `server.js` → (middleware `autenticacao.js`, se a rota for protegida) → arquivo de rota → banco (`db.js`) → resposta em JSON.

## Como rodar

1. Instale o **Node.js** (versão 20 ou mais nova) e o **MySQL**.
2. No MySQL Workbench, abra e execute o arquivo `sql/banco.sql`.
3. Nesta pasta (`backend`), instale as dependências:
   ```bash
   npm install
   ```
4. Copie `.env.example` para `.env` e preencha a senha do seu MySQL e um `JWT_SECRET`.
5. Inicie a API:
   ```bash
   npm start
   ```
   Deve aparecer: `API do Finanza rodando em http://localhost:3000`

> No Windows, se o PowerShell bloquear o `npm`, use `npm.cmd install` e `npm.cmd start`.

## Rotas

As rotas marcadas com 🔒 precisam do token do login no cabeçalho:
`Authorization: Bearer SEU_TOKEN`

| Método | Rota                        | Tela do app            | O que faz                                   |
|--------|-----------------------------|------------------------|---------------------------------------------|
| GET    | `/`                         | —                      | Testa se a API está no ar                   |
| POST   | `/api/auth/cadastro`        | Cadastro               | Cria um usuário                             |
| POST   | `/api/auth/login`           | Login                  | Faz login e devolve o token                 |
| GET    | `/api/usuario/perfil` 🔒    | Configurações          | Nome e e-mail do usuário logado             |
| GET    | `/api/categorias` 🔒        | Nova transação         | Lista categorias (`?tipo=receita\|despesa`) |
| GET    | `/api/transacoes` 🔒        | Transações / Receitas / Despesas | Lista transações (filtros abaixo) |
| GET    | `/api/transacoes/:id` 🔒    | Detalhes da transação  | Uma transação                               |
| POST   | `/api/transacoes` 🔒        | Nova transação         | Cria uma transação                          |
| PUT    | `/api/transacoes/:id` 🔒    | Detalhes (Editar)      | Edita uma transação                         |
| DELETE | `/api/transacoes/:id` 🔒    | Detalhes (Excluir)     | Exclui (exclusão lógica)                    |
| GET    | `/api/resumo` 🔒            | Dashboard              | Saldo, receitas, despesas e despesas por categoria |

**Filtros de `GET /api/transacoes`** (opcionais e combináveis):
`?tipo=despesa`, `?busca=mercado`, `?mes=2026-09`.
O `/api/resumo` também aceita `?mes=2026-09`.

### Exemplos

Cadastro — `POST /api/auth/cadastro`
```json
{ "nome": "Ana Souza", "email": "ana@email.com", "senha": "12345678" }
```

Login — `POST /api/auth/login` → resposta:
```json
{ "mensagem": "Login realizado com sucesso!", "token": "eyJhbGci...", "usuario": { "id": 1, "nome": "Ana Souza", "email": "ana@email.com" } }
```

Nova transação — `POST /api/transacoes` (mesmo formato do tipo `Transacao` do app)
```json
{ "descricao": "Cinema com amigos", "valor": 78, "tipo": "despesa", "categoria": "Lazer", "data": "2026-09-21" }
```

Resumo — `GET /api/resumo` → resposta:
```json
{ "saldo": 3479.5, "receitas": 5000, "despesas": 1520.5,
  "despesasPorCategoria": [ { "nome": "Moradia", "valor": 1200 }, { "nome": "Alimentação", "valor": 320.5 } ] }
```

## Códigos de resposta usados

| Código | Significado                                         |
|--------|-----------------------------------------------------|
| 200    | Deu certo                                           |
| 201    | Criado com sucesso (cadastro, nova transação)       |
| 400    | Dados inválidos (falta campo, valor negativo...)    |
| 401    | Sem token, token inválido ou senha errada           |
| 404    | Não encontrado                                      |
| 409    | E-mail já cadastrado                                |
| 500    | Erro interno (ex.: banco fora do ar)                |

## Decisões do projeto (bom para explicar)

- **Senhas com bcrypt:** o banco guarda só o hash; nem quem acessa o banco vê a senha.
- **JWT:** depois do login, o app envia o token em cada requisição. O middleware confere o token e descobre qual usuário está logado, assim cada usuário só vê as próprias transações.
- **Consultas com `?`:** os valores são passados separados do SQL, o que evita **SQL Injection**.
- **Exclusão lógica:** excluir uma transação só preenche `excluido_em`; o registro continua no banco (histórico), mas some do app.
- **Tipo vem da categoria:** a tabela `transacoes` não tem coluna `tipo`; ela é descoberta pela categoria (Salário é receita, Moradia é despesa...).
