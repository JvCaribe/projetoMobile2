# Finanza – app de organização financeira

Aplicativo mobile para controlar receitas e despesas, feito com **Ionic + React** (frontend) e uma **API REST em Node.js + MySQL** (backend). Projeto acadêmico.

> **Importante:** o frontend consome a API do backend (`http://localhost:3000`). Para usar o app é preciso ter o **MySQL, o backend e o frontend rodando**, nessa ordem (veja [Como executar](#como-executar)). Não há usuário padrão: crie uma conta na tela de cadastro.

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
| Login | `/login` | E-mail e senha (com mostrar/ocultar). Autentica na API e guarda o token da sessão. |
| Cadastro | `/cadastro` | Valida nome completo, e-mail, senha com no mínimo 8 caracteres e confirmação, e cria a conta na API. |
| Dashboard | `/dashboard` | Saldo (com ocultar), barras de receitas × despesas, despesas por categoria e transações recentes. Os botões **Ver Receitas** e **Ver Despesas** abrem as páginas abaixo. Dados vindos da API (`/api/resumo`, `/api/transacoes` e `/api/usuario/perfil`). |
| Transações | `/transacoes` | Extrato agrupado por mês, com busca (ignora acentos) e filtros Todas / Receitas / Despesas. O botão **+** abre a Nova Transação e tocar em um item abre os detalhes. |
| Nova Transação | `/transacoes/nova` | Despesa ou Receita, valor com máscara de moeda, categoria, descrição e data. Salvar fica desabilitado até o formulário estar completo e grava na API. |
| Detalhes | `/transacoes/:id` | Dados de uma transação, **edição** em uma janela sobre a tela e **exclusão** com confirmação (exclusão lógica no banco). |
| Receitas / Despesas | `/receitas`, `/despesas` | Total do tipo, quantidade e lista das transações, da mais recente para a mais antiga. |
| Configurações | `/configuracoes` | Perfil do usuário logado, informações do app e escolha do tema. |

Recursos gerais:

- **Tema claro e escuro**, com a escolha salva no aparelho e aplicada em todas as telas ao abrir o app.
- **Cores seguindo o guia de UI/UX** (categorias, barras e botões de receitas e despesas, nos dois temas).
- **Acessibilidade:** rótulos em botões de ícone, foco visível, textos para leitores de tela nos valores e diálogo de confirmação com controle de foco.
- **Persistência:** transações, categorias e usuários ficam no MySQL. Avisos de sucesso e erro aparecem como mensagens no topo da tela.
- **Layout responsivo:** as telas se adaptam a celulares, tablets e janelas largas de computador.

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

### 1. Banco de dados

```bash
npm run build        # confere os tipos (tsc) e gera a pasta dist
npm run preview      # serve o resultado do build
npm run test:unit    # testes unitários (Vitest)
npm run lint         # ESLint + Prettier
```

Use **somente** `backend/sql/banco.sql`. Ele cria o banco `finanza`, as tabelas e as categorias padrão, e pode ser executado mais de uma vez.

- **MySQL Workbench:** abra o arquivo e execute tudo.
- **Linha de comando:**
  ```bash
  mysql -u root -p < backend/sql/banco.sql
  ```

### 2. Backend (API)

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

### 3. Frontend

Com o backend rodando, em **outro terminal**:

```bash
cd projetomobile
npm install
npm run dev
```

Abra **http://localhost:5173**, crie uma conta em **Cadastro** e faça login. Para uma visão de celular, use as ferramentas do navegador (F12 → modo dispositivo).

Outros comandos úteis, também dentro de `projetomobile`:

```bash
npm run build        # confere os tipos (tsc) e gera a pasta dist
npm run preview      # serve o resultado do build
npm run test:unit    # testes unitários (Vitest)
npm run lint         # ESLint + Prettier
```

### Testando a API

Abra `backend/testes.http` no VS Code com a extensão **REST Client** (ou copie os exemplos para o Postman ou Insomnia). A ordem sugerida é: cadastro → login → copiar o `token` para a variável `@token` → demais rotas.

## Documentação adicional

- [`backend/README.md`](backend/README.md): rotas, filtros, códigos de resposta e decisões da API.

