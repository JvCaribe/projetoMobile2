// Rotas de autenticacao: cadastro e login.
// Usadas pelas telas Cadastro.tsx e Login.tsx do app.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// Expressao regular simples para validar o formato do e-mail
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------
// POST /api/auth/cadastro
// Corpo: { "nome": "Ana Souza", "email": "ana@email.com", "senha": "12345678" }
// ---------------------------------------------------------------------
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body || {};

  // 1) Validacao dos dados (as mesmas regras da tela de cadastro)
  if (typeof nome !== 'string' || !nome.trim()) {
    return res.status(400).json({ mensagem: 'Informe o nome.' });
  }
  if (typeof email !== 'string' || !REGEX_EMAIL.test(email)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }
  if (typeof senha !== 'string' || senha.length < 8) {
    return res.status(400).json({ mensagem: 'A senha precisa ter pelo menos 8 caracteres.' });
  }

  const emailNormalizado = email.trim().toLowerCase();

  // 2) Verifica se o e-mail ja esta cadastrado
  const [existentes] = await db.query('SELECT id FROM usuarios WHERE email = ?', [emailNormalizado]);
  if (existentes.length > 0) {
    return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
  }

  // 3) Gera o hash da senha. O bcrypt transforma a senha num texto
  //    irreversivel; o numero 10 e o "custo" (quanto maior, mais seguro e lento).
  const senhaHash = await bcrypt.hash(senha, 10);

  // 4) Salva no banco. O "?" evita SQL Injection: o mysql2 trata os valores.
  const [resultado] = await db.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
    [nome.trim(), emailNormalizado, senhaHash]
  );

  // 201 = "Created" (recurso criado com sucesso)
  return res.status(201).json({
    mensagem: 'Cadastro realizado com sucesso!',
    usuario: { id: resultado.insertId, nome: nome.trim(), email: emailNormalizado },
  });
});

// ---------------------------------------------------------------------
// POST /api/auth/login
// Corpo: { "email": "ana@email.com", "senha": "12345678" }
// Resposta: um token JWT que o app deve guardar e enviar nas outras rotas.
// ---------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, senha } = req.body || {};

  if (typeof email !== 'string' || typeof senha !== 'string') {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
  }

  // 1) Procura o usuario pelo e-mail
  const [linhas] = await db.query(
    'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  const usuario = linhas[0];

  // 2) Compara a senha digitada com o hash salvo.
  //    A mensagem de erro e a mesma nos dois casos para nao revelar
  //    se o e-mail existe ou nao.
  const senhaCorreta = usuario && (await bcrypt.compare(senha, usuario.senha_hash));
  if (!senhaCorreta) {
    return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
  }

  // 3) Gera o token JWT com o id do usuario dentro. Ele vale por 1 dia.
  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  return res.json({
    mensagem: 'Login realizado com sucesso!',
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

module.exports = router;
