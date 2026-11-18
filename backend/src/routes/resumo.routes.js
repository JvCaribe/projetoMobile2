// Rota de resumo financeiro - alimenta a tela Dashboard.tsx
// (saldo total, total de receitas, total de despesas e despesas por categoria).
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// ---------------------------------------------------------------------
// GET /api/resumo            -> considera todas as transacoes
// GET /api/resumo?mes=2026-09 -> considera so aquele mes
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { mes } = req.query;

  // Filtro comum as duas consultas abaixo
  let filtro = 't.usuario_id = ? AND t.excluido_em IS NULL';
  const parametros = [req.usuarioId];
  if (mes) {
    filtro += " AND DATE_FORMAT(t.data_transacao, '%Y-%m') = ?";
    parametros.push(mes);
  }

  // 1) Totais de receitas e despesas numa unica consulta.
  //    SUM(CASE ...) soma o valor so quando o tipo bate; COALESCE troca
  //    NULL por 0 quando o usuario ainda nao tem transacoes.
  const [[totais]] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN c.tipo = 'receita' THEN t.valor END), 0) AS receitas,
       COALESCE(SUM(CASE WHEN c.tipo = 'despesa' THEN t.valor END), 0) AS despesas
     FROM transacoes t
     JOIN categorias c ON c.id = t.categoria_id
     WHERE ${filtro}`,
    parametros
  );

  // 2) Despesas agrupadas por categoria (lista "Despesas por categoria")
  const [porCategoria] = await db.query(
    `SELECT c.nome, SUM(t.valor) AS valor
     FROM transacoes t
     JOIN categorias c ON c.id = t.categoria_id
     WHERE ${filtro} AND c.tipo = 'despesa'
     GROUP BY c.nome
     ORDER BY valor DESC`,
    parametros
  );

  const receitas = Number(totais.receitas);
  const despesas = Number(totais.despesas);

  return res.json({
    saldo: receitas - despesas,
    receitas,
    despesas,
    despesasPorCategoria: porCategoria.map((c) => ({ nome: c.nome, valor: Number(c.valor) })),
  });
});

module.exports = router;
