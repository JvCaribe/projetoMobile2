// =====================================================================
// SERVIDOR DA API DO FINANZA
// Ponto de entrada do backend: configura o Express, registra as rotas
// e liga o servidor. Rode com:  npm start
// =====================================================================

// Carrega as variaveis do arquivo .env para process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const autenticar = require('./middleware/autenticacao');

// Importa os arquivos de rotas (cada um cuida de uma parte do app)
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const transacoesRoutes = require('./routes/transacoes.routes');
const resumoRoutes = require('./routes/resumo.routes');

// Sem a chave do JWT nao da para gerar tokens, entao paramos logo aqui
if (!process.env.JWT_SECRET) {
  console.error('Erro: configure o JWT_SECRET no arquivo .env');
  process.exit(1);
}

const app = express();

// ---- Middlewares globais (rodam em todas as requisicoes) ----
// CORS: permite que o app Ionic (que roda em outra porta, ex.: 8100)
// faca requisicoes para esta API.
app.use(cors());
// Permite ler o corpo das requisicoes em JSON (req.body)
app.use(express.json());

// ---- Rotas ----
// Rota simples para testar se a API esta no ar
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Finanza funcionando!' });
});

// Rotas PUBLICAS (nao precisam de login)
app.use('/api/auth', authRoutes);

// Rotas PROTEGIDAS: o middleware "autenticar" roda antes e exige o token
app.use('/api/usuario', autenticar, usuarioRoutes);
app.use('/api/categorias', autenticar, categoriasRoutes);
app.use('/api/transacoes', autenticar, transacoesRoutes);
app.use('/api/resumo', autenticar, resumoRoutes);

// Qualquer rota que nao existe cai aqui (404 = nao encontrado)
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Tratamento de erros: se alguma rota der erro inesperado (ex.: banco fora
// do ar), o Express 5 manda o erro para ca e respondemos 500.
app.use((erro, req, res, next) => {
  // JSON mal formatado enviado pelo app
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição.' });
  }
  console.error('Erro na API:', erro.message);
  res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

// ---- Liga o servidor ----
// Antes de abrir a porta, testamos a conexao com o banco. Se o MySQL
// estiver desligado ou o .env errado, mostramos o erro e encerramos.
const PORTA = process.env.PORT || 3000;

db.query('SELECT 1')
  .then(() => {
    app.listen(PORTA, () => {
      console.log(`API do Finanza rodando em http://localhost:${PORTA}`);
    });
  })
  .catch((erro) => {
    console.error('Não foi possível conectar ao MySQL:', erro.message);
    process.exit(1);
  });
