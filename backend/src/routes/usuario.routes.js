// Rotas do usuario logado (perfil).
// Usada pela tela Configuracoes.tsx para mostrar nome e e-mail no CardPerfil.
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// ---------------------------------------------------------------------
// GET /api/usuario/perfil  (precisa de token)
// ---------------------------------------------------------------------
router.get('/perfil', async (req, res) => {
  // req.usuarioId foi preenchido pelo middleware de autenticacao
  const [linhas] = await db.query(
    'SELECT id, nome, email FROM usuarios WHERE id = ?',
    [req.usuarioId]
  );

  if (linhas.length === 0) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  }

  return res.json(linhas[0]);
});

module.exports = router;
