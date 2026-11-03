require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const { rateLimit } = require('express-rate-limit');
const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Configure ${name} no arquivo .env`);
}
if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('SUBSTITUA')) {
  throw new Error('Configure JWT_SECRET com uma chave aleatoria segura (32+ caracteres).');
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { mensagem: 'Muitas tentativas. Aguarde alguns minutos.' }
});
const normalizarEmail = email => email.trim().toLowerCase();
const emailValido = email => typeof email === 'string' && email.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const senhaValida = senha => typeof senha === 'string' && senha.length >= 8 && senha.length <= 72;
const mensagemRecuperacao = 'Se o e-mail estiver cadastrado, voce recebera instrucoes para recuperar sua senha.';

async function autenticarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !/^Bearer\s+\S+$/.test(auth)) return res.status(401).json({ mensagem: 'Token nao informado.' });
  try {
    const payload = jwt.verify(auth.split(/\s+/)[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const [rows] = await db.execute('SELECT id, nome, email, versao_token FROM usuarios WHERE id = ?', [payload.id]);
    if (!rows.length || rows[0].versao_token !== payload.versao) {
      return res.status(401).json({ mensagem: 'Sessao invalida. Faca login novamente.' });
    }
    req.usuario = { id: rows[0].id, nome: rows[0].nome, email: rows[0].email };
    next();
  } catch (erro) {
    if (erro.name === 'JsonWebTokenError' || erro.name === 'TokenExpiredError' || erro.name === 'NotBeforeError') {
      return res.status(401).json({ mensagem: 'Token invalido ou expirado.' });
    }
    next(erro);
  }
}

app.get('/', (req, res) => res.json({ mensagem: 'Servidor do Finanza funcionando!' }));

app.post('/api/auth/register', limiter, async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100 || !emailValido(email) || !senhaValida(senha)) {
      return res.status(400).json({ mensagem: 'Informe nome (ate 100 caracteres), e-mail valido e senha de 8 a 72 caracteres.' });
    }
    const emailNormalizado = normalizarEmail(email);
    const senhaHash = await bcrypt.hash(senha, 12);
    try {
      const [result] = await db.execute('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)', [nome.trim(), emailNormalizado, senhaHash]);
      return res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', usuario: { id: result.insertId, nome: nome.trim(), email: emailNormalizado } });
    } catch (erro) {
      if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Este e-mail ja esta cadastrado.' });
      throw erro;
    }
  } catch (erro) { next(erro); }
});

app.post('/api/auth/login', limiter, async (req, res, next) => {
  try {
    const { email, senha } = req.body || {};
    if (!emailValido(email) || typeof senha !== 'string' || !senha) {
      return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
    }
    const [rows] = await db.execute('SELECT id, nome, email, senha_hash, versao_token FROM usuarios WHERE email = ?', [normalizarEmail(email)]);
    // Compara tambem para usuario inexistente, reduzindo diferencas de tempo.
    const hash = rows[0]?.senha_hash || '$2b$12$7EqJtq98hPqEX7fNZaFWoOeK.LI6oS2u7AqL8L/2F0wW/m5LPrRkS';
    const valido = await bcrypt.compare(senha, hash);
    if (!rows.length || !valido) return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    const usuario = rows[0];
    const token = jwt.sign({ id: usuario.id, versao: usuario.versao_token }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
    return res.json({ mensagem: 'Login realizado com sucesso!', token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (erro) { next(erro); }
});

app.get('/api/perfil', autenticarToken, (req, res) => res.json({ mensagem: 'Area protegida.', usuario: req.usuario }));

function smtpConfigurado() {
  return ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'APP_URL'].every(key => !!process.env[key]);
}
async function enviarRecuperacao(email, token) {
  const porta = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: porta, secure: porta === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    disableFileAccess: true, disableUrlAccess: true
  });
  const url = new URL(process.env.APP_URL);
  url.pathname = '/redefinir-senha';
  url.search = new URLSearchParams({ token }).toString();
  await transport.sendMail({ from: process.env.SMTP_FROM, to: email,
    subject: 'Finanza - Recuperacao de senha',
    text: `Para redefinir sua senha, abra este link (valido por 15 minutos): ${url.toString()}\nSe nao solicitou, ignore este e-mail.`
  });
}

app.post('/api/auth/esqueci-senha', limiter, async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!emailValido(email)) return res.status(400).json({ mensagem: 'Informe um e-mail valido.' });
    if (!smtpConfigurado()) return res.status(503).json({ mensagem: 'Recuperacao por e-mail ainda nao configurada.' });
    const [rows] = await db.execute('SELECT id, email FROM usuarios WHERE email = ?', [normalizarEmail(email)]);
    if (rows.length) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await db.execute('DELETE FROM recuperacoes_senha WHERE usuario_id = ?', [rows[0].id]);
      await db.execute('INSERT INTO recuperacoes_senha (token_hash, usuario_id, expira_em) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE))', [tokenHash, rows[0].id]);
      try { await enviarRecuperacao(rows[0].email, token); }
      catch (erro) {
        await db.execute('DELETE FROM recuperacoes_senha WHERE token_hash = ?', [tokenHash]);
        console.error('Falha no envio do e-mail de recuperacao:', erro.message);
        return res.status(503).json({ mensagem: 'Nao foi possivel enviar o e-mail agora. Tente mais tarde.' });
      }
    }
    return res.json({ mensagem: mensagemRecuperacao });
  } catch (erro) { next(erro); }
});

app.post('/api/auth/redefinir-senha', limiter, async (req, res, next) => {
  const { token, novaSenha } = req.body || {};
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || !senhaValida(novaSenha)) {
    return res.status(400).json({ mensagem: 'Token invalido ou senha fora do limite de 8 a 72 caracteres.' });
  }
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const conexao = await db.getConnection().catch(next);
  if (!conexao) return;
  try {
    await conexao.beginTransaction();
    const [tokens] = await conexao.execute('SELECT usuario_id FROM recuperacoes_senha WHERE token_hash = ? AND expira_em > UTC_TIMESTAMP() FOR UPDATE', [hash]);
    if (!tokens.length) {
      await conexao.rollback();
      return res.status(400).json({ mensagem: 'Token invalido ou expirado.' });
    }
    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await conexao.execute('UPDATE usuarios SET senha_hash = ?, versao_token = versao_token + 1 WHERE id = ?', [senhaHash, tokens[0].usuario_id]);
    await conexao.execute('DELETE FROM recuperacoes_senha WHERE usuario_id = ?', [tokens[0].usuario_id]);
    await conexao.commit();
    return res.json({ mensagem: 'Senha redefinida com sucesso! Faca login novamente.' });
  } catch (erro) {
    await conexao.rollback();
    next(erro);
  } finally { conexao.release(); }
});

app.use((erro, req, res, next) => {
  console.error('Erro na API:', erro.message);
  res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

const porta = Number(process.env.PORT || 3000);
if (require.main === module) {
  db.query('SELECT 1').then(() => {
    app.listen(porta, () => console.log(`Finanza API rodando na porta ${porta}`));
  }).catch(erro => { console.error('Falha ao conectar ao MySQL:', erro.message); process.exitCode = 1; db.end(); });
}
module.exports = { app, db };
