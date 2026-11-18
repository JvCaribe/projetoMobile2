// Rotas de transacoes (receitas e despesas) - o CRUD principal do app.
// Usadas pelas telas Transacoes, NovaTransacao, DetalhesTransacoes e
// TransacoesPorTipo.
//
// Todas as rotas so mexem nas transacoes do usuario logado (req.usuarioId),
// entao um usuario nunca ve nem altera os dados de outro.
const express = require('express');
const db = require('../config/db');

const router = express.Router();

// SELECT base reaproveitado nas consultas. Ele junta (JOIN) a transacao com
// a categoria e devolve os campos com os MESMOS nomes que o app ja usa no
// tipo "Transacao" (src/data/transacoes.ts): id, descricao, categoria,
// valor, tipo e data.
const SELECT_TRANSACAO = `
  SELECT t.id,
         t.descricao,
         c.nome            AS categoria,
         t.valor,
         c.tipo,
         t.data_transacao  AS data
  FROM transacoes t
  JOIN categorias c ON c.id = t.categoria_id
`;

// O MySQL devolve DECIMAL como texto ("78.00"); aqui convertemos para numero.
function formatar(transacao) {
  return { ...transacao, valor: Number(transacao.valor) };
}

// Valida os dados enviados pelo app ao criar ou editar uma transacao.
// Se estiver tudo certo, devolve null; senao, devolve a mensagem de erro.
function validar({ descricao, valor, tipo, categoria, data }) {
  if (typeof descricao !== 'string' || !descricao.trim()) return 'Informe a descrição.';
  if (typeof valor !== 'number' || valor <= 0) return 'O valor deve ser um número maior que zero.';
  if (tipo !== 'receita' && tipo !== 'despesa') return 'O tipo deve ser "receita" ou "despesa".';
  if (typeof categoria !== 'string' || !categoria) return 'Informe a categoria.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) return 'A data deve estar no formato AAAA-MM-DD.';
  return null;
}

// O app envia o NOME da categoria (ex.: "Lazer") e o tipo. Aqui buscamos o id
// dela no banco. Precisamos do tipo porque "Outros" existe nos dois tipos.
async function buscarCategoriaId(nome, tipo, usuarioId) {
  const [linhas] = await db.query(
    `SELECT id FROM categorias
     WHERE nome = ? AND tipo = ? AND (usuario_id IS NULL OR usuario_id = ?)
     LIMIT 1`,
    [nome, tipo, usuarioId]
  );
  return linhas.length > 0 ? linhas[0].id : null;
}

// ---------------------------------------------------------------------
// GET /api/transacoes
// Filtros opcionais (query string), todos podem ser combinados:
//   ?tipo=receita | despesa   -> telas /receitas e /despesas
//   ?busca=mercado            -> campo de busca da tela de Transacoes
//   ?mes=2026-09              -> so as transacoes daquele mes
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { tipo, busca, mes } = req.query;

  // Comecamos com o filtro obrigatorio e vamos adicionando os opcionais
  let sql = SELECT_TRANSACAO + ' WHERE t.usuario_id = ? AND t.excluido_em IS NULL';
  const parametros = [req.usuarioId];

  if (tipo) {
    sql += ' AND c.tipo = ?';
    parametros.push(tipo);
  }
  if (busca) {
    // Procura o texto na descricao OU no nome da categoria
    sql += ' AND (t.descricao LIKE ? OR c.nome LIKE ?)';
    parametros.push(`%${busca}%`, `%${busca}%`);
  }
  if (mes) {
    sql += " AND DATE_FORMAT(t.data_transacao, '%Y-%m') = ?";
    parametros.push(mes);
  }

  // Mais recentes primeiro (igual ao extrato do app)
  sql += ' ORDER BY t.data_transacao DESC, t.id DESC';

  const [transacoes] = await db.query(sql, parametros);
  return res.json(transacoes.map(formatar));
});

// ---------------------------------------------------------------------
// GET /api/transacoes/:id  -> detalhes de uma transacao
// ---------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const [linhas] = await db.query(
    SELECT_TRANSACAO + ' WHERE t.id = ? AND t.usuario_id = ? AND t.excluido_em IS NULL',
    [req.params.id, req.usuarioId]
  );

  if (linhas.length === 0) {
    return res.status(404).json({ mensagem: 'Transação não encontrada.' });
  }
  return res.json(formatar(linhas[0]));
});

// ---------------------------------------------------------------------
// POST /api/transacoes  -> cria uma transacao
// Corpo: { "descricao": "Cinema", "valor": 78, "tipo": "despesa",
//          "categoria": "Lazer", "data": "2026-09-21" }
// ---------------------------------------------------------------------
router.post('/', async (req, res) => {
  const erro = validar(req.body || {});
  if (erro) return res.status(400).json({ mensagem: erro });

  const { descricao, valor, tipo, categoria, data } = req.body;

  const categoriaId = await buscarCategoriaId(categoria, tipo, req.usuarioId);
  if (!categoriaId) {
    return res.status(400).json({ mensagem: `Categoria "${categoria}" não existe para ${tipo}.` });
  }

  const [resultado] = await db.query(
    `INSERT INTO transacoes (usuario_id, categoria_id, valor, descricao, data_transacao)
     VALUES (?, ?, ?, ?, ?)`,
    [req.usuarioId, categoriaId, valor, descricao.trim(), data]
  );

  // Devolve a transacao criada, ja com o id gerado pelo banco
  return res.status(201).json({
    id: resultado.insertId,
    descricao: descricao.trim(),
    categoria,
    valor,
    tipo,
    data,
  });
});

// ---------------------------------------------------------------------
// PUT /api/transacoes/:id  -> edita uma transacao (botao "Editar")
// Corpo: o mesmo do POST
// ---------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const erro = validar(req.body || {});
  if (erro) return res.status(400).json({ mensagem: erro });

  const { descricao, valor, tipo, categoria, data } = req.body;

  const categoriaId = await buscarCategoriaId(categoria, tipo, req.usuarioId);
  if (!categoriaId) {
    return res.status(400).json({ mensagem: `Categoria "${categoria}" não existe para ${tipo}.` });
  }

  // O "AND usuario_id = ?" garante que so o dono consegue editar
  const [resultado] = await db.query(
    `UPDATE transacoes
     SET categoria_id = ?, valor = ?, descricao = ?, data_transacao = ?
     WHERE id = ? AND usuario_id = ? AND excluido_em IS NULL`,
    [categoriaId, valor, descricao.trim(), data, req.params.id, req.usuarioId]
  );

  // affectedRows = quantas linhas o UPDATE alterou. 0 = nao achou.
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensagem: 'Transação não encontrada.' });
  }

  return res.json({ id: Number(req.params.id), descricao: descricao.trim(), categoria, valor, tipo, data });
});

// ---------------------------------------------------------------------
// DELETE /api/transacoes/:id  -> exclui uma transacao (botao "Excluir")
// Usamos EXCLUSAO LOGICA: em vez de apagar a linha, preenchemos a coluna
// excluido_em com a data de agora. Assim o historico nao se perde.
// ---------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  const [resultado] = await db.query(
    `UPDATE transacoes SET excluido_em = NOW()
     WHERE id = ? AND usuario_id = ? AND excluido_em IS NULL`,
    [req.params.id, req.usuarioId]
  );

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensagem: 'Transação não encontrada.' });
  }
  return res.json({ mensagem: 'Transação excluída com sucesso.' });
});

module.exports = router;
