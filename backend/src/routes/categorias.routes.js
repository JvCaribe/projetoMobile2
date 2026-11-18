// Rotas de categorias.
// Usada na tela NovaTransacao.tsx para listar as categorias de cada tipo.
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// ---------------------------------------------------------------------
// GET /api/categorias            -> todas
// GET /api/categorias?tipo=receita -> so as de receita
// GET /api/categorias?tipo=despesa -> so as de despesa
// Retorna as categorias padrao (usuario_id NULL) + as criadas pelo usuario.
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { tipo } = req.query;

  let sql = 'SELECT id, nome, tipo FROM categorias WHERE (usuario_id IS NULL OR usuario_id = ?)';
  const parametros = [req.usuarioId];

  // Filtro opcional por tipo
  if (tipo) {
    if (tipo !== 'receita' && tipo !== 'despesa') {
      return res.status(400).json({ mensagem: 'O tipo deve ser "receita" ou "despesa".' });
    }
    sql += ' AND tipo = ?';
    parametros.push(tipo);
  }

  sql += ' ORDER BY tipo, nome';

  const [categorias] = await db.query(sql, parametros);
  return res.json(categorias);
});

module.exports = router;
