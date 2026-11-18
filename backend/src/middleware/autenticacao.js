// Middleware de autenticacao.
// Um middleware e uma funcao que roda ANTES da rota. Este aqui confere se
// a requisicao trouxe um token JWT valido. Se sim, deixa passar; se nao,
// responde 401 (nao autorizado) e a rota nem chega a executar.
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  // O app envia o token no cabecalho assim:  Authorization: Bearer <token>
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token não informado. Faça login.' });
  }

  try {
    // jwt.verify confere a assinatura e a validade. Se o token foi alterado
    // ou expirou, ele lanca um erro e caimos no catch.
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos o id do usuario na requisicao para as rotas usarem depois.
    req.usuarioId = dados.id;
    next(); // segue para a rota
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = autenticar;
