# projetoMobile2

# Finanza – app de organização financeira

Aplicativo mobile para controlar receitas e despesas, feito com **Ionic + React** (frontend) e uma **API REST em Node.js + MySQL** (backend). Projeto acadêmico.

> **Estado atual:** o frontend ainda usa **dados de exemplo** (`projetomobile/src/data/transacoes.ts` e constantes do Dashboard) e **não chama a API**. O backend está pronto e pode ser testado separadamente (veja [Testando a API](#testando-a-api)). A integração entre os dois é o próximo passo.

## Estrutura do repositório

```
projetoMobile2/
├── projetomobile/   # Frontend (Ionic + React + Vite + Capacitor)
├── backend/         # API REST (Express + MySQL)
│   ├── sql/banco.sql   # Script ÚNICO que cria o banco, as tabelas e as categorias
│   ├── src/            # server, rotas, middleware de autenticação e conexão com o banco
│   └── testes.http     # Exemplos de requisições para testar a API
├── database/        # Scripts SQL antigos (veja o aviso abaixo)
└── ALTERACOES.md    # Registro das alterações feitas no frontend
```

## Funcionalidades

### Frontend (`projetomobile`)

| Tela | Rota | O que faz |
|---|---|---|
| Login | `/login` | E-mail e senha (com mostrar/ocultar). Só valida e registra no console, ainda sem chamar a API. |
| Cadastro | `/cadastro` | Valida nome completo, e-mail, senha com no mínimo 8 caracteres e confirmação. Ainda sem chamar a API. |
| Dashboard | `/dashboard` | Saldo (com ocultar), barras de receitas × despesas, despesas por categoria e transações recentes. Os botões **Ver Receitas** e **Ver Despesas** abrem as páginas abaixo. Dados fixos. |
| Transações | `/transacoes` | Extrato agrupado por mês, com busca (ignora acentos) e filtros Todas / Receitas / Despesas. O botão **+** abre a Nova Transação. |
| Nova Transação | `/transacoes/nova` | Despesa ou Receita, valor com máscara de moeda, categoria, descrição e data. Salvar fica desabilitado até o formulário estar completo. |
| Detalhes | `/transacoes/:id` | Dados de uma transação e exclusão com confirmação. O botão **Editar** ainda não está implementado. |
| Receitas / Despesas | `/receitas`, `/despesas` | Total do tipo, quantidade e lista das transações, da mais recente para a mais antiga. |
| Configurações | `/configuracoes` | Perfil, informações do app e escolha do tema. |

Recursos gerais:

- **Tema claro e escuro**, com a escolha salva no aparelho e aplicada em todas as telas ao abrir o app.
- **Cores seguindo o guia de UI/UX** (categorias, barras e botões de receitas e despesas, nos dois temas).
- **Acessibilidade:** rótulos em botões de ícone, foco visível, textos para leitores de tela nos valores e diálogo de confirmação com controle de foco.
- Transações criadas na tela "Nova Transação" aparecem nas listas enquanto o app estiver aberto (ficam só em memória).

### Backend (`backend`)

- **Cadastro e login** com senha protegida por hash (bcrypt) e autenticação por token JWT (validade de 1 dia).
- **Perfil** do usuário logado.
- **Categorias** padrão de receita e despesa (filtro por tipo).
- **CRUD de transações:** listar (com filtros por tipo, texto e mês), detalhar, criar, editar e excluir. A exclusão é lógica: o registro continua no banco, mas some das consultas.
- **Resumo do Dashboard:** saldo, total de receitas, total de despesas e despesas por categoria (opcionalmente por mês).
- Cada usuário só enxerga e altera as próprias transações.

Lista completa das rotas, códigos de resposta e exemplos em [`backend/README.md`](backend/README.md).

## Tecnologias

**Frontend**

- Ionic React 9, React 19 e TypeScript 5.9
- Vite 8 (build e servidor de desenvolvimento)
- React Router 6
- Capacitor 8 (para empacotar como app Android/iOS)
- Vitest + Testing Library (testes unitários) e Playwright (testes e2e)
- ESLint e Prettier

**Backend**

- Node.js 20 ou mais novo
- Express 5
- MySQL 8 com `mysql2`
- `bcryptjs` (hash de senhas), `jsonwebtoken` (JWT), `cors` e `dotenv`

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou mais novo (inclui o `npm`)
- [MySQL](https://dev.mysql.com/downloads/) **8.0.16 ou mais novo** (versões anteriores ignoram as regras `CHECK` das tabelas)

> No Windows, se o PowerShell bloquear o `npm`, use `npm.cmd` no lugar de `npm`.

### 1. Frontend (funciona sozinho, com dados de exemplo)

```bash
cd projetomobile
npm install
npm run dev
```

Abra **http://localhost:5173**. Para uma visão de celular, use as ferramentas do navegador (F12 → modo dispositivo).

Outros comandos úteis, também dentro de `projetomobile`:

```bash
npm run build        # confere os tipos (tsc) e gera a pasta dist
npm run preview      # serve o resultado do build
npm run test:unit    # testes unitários (Vitest)
npm run lint         # ESLint + Prettier
```

### 2. Banco de dados

Use **somente** `backend/sql/banco.sql`. Ele cria o banco `finanza`, as tabelas e as categorias padrão, e pode ser executado mais de uma vez.

- **MySQL Workbench:** abra o arquivo e execute tudo.
- **Linha de comando:**
  ```bash
  mysql -u root -p < backend/sql/banco.sql
  ```

### 3. Backend (API)

```bash
cd backend
npm install
cp .env.example .env     # no Windows: copy .env.example .env
```

Edite o `.env` e preencha `DB_PASSWORD` (senha do seu MySQL) e `JWT_SECRET` (um texto longo e aleatório). Para gerar um segredo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Inicie a API:

```bash
npm start          # ou: npm run dev  (reinicia ao salvar arquivos)
```

Deve aparecer `API do Finanza rodando em http://localhost:3000`. Se aparecer `Não foi possível conectar ao MySQL`, confira se o MySQL está ligado e se os dados do `.env` estão certos.

### Testando a API

Abra `backend/testes.http` no VS Code com a extensão **REST Client** (ou copie os exemplos para o Postman ou Insomnia). A ordem sugerida é: cadastro → login → copiar o `token` para a variável `@token` → demais rotas.

