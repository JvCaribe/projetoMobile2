# Finanza — Autenticacao e recuperacao de senha

Responsabilidades: cadastro e login com bcrypt/JWT, middleware de autenticacao, solicitacao e redefinicao de senha.

## Integracao com o banco do colega

Este backend utiliza **MySQL**, e NAO SQLite. Espera a tabela `usuarios` criada pelo colega (`id`, `nome`, `email`, `senha_hash`). A migracao `migracao_recuperacao.sql` acrescenta `versao_token` e a tabela `recuperacoes_senha`. **Executar uma unica vez** apos confirmar que a tabela `usuarios` existe. A migracao ALTER nao e idempotente; nao repetir.

## Instalacao no Windows

1. Ter Node.js e MySQL em execucao. Obter com o responsavel do banco o host, usuario e senha de desenvolvimento (nao colocar segredos no Git).
2. Abrir terminal nesta pasta e executar `npm.cmd install`.
3. Copiar `.env.example` para `.env` e preencher DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME. Gerar JWT_SECRET com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
4. Executar a migracao SQL no banco `finanza` (por exemplo, no MySQL Workbench).
5. Rodar `npm.cmd audit` e `npm.cmd run check`.
6. Iniciar com `npm.cmd start`. O servidor so inicia depois de conectar ao MySQL.

## Rotas

- `GET /` — verificacao simples.
- `POST /api/auth/register` — JSON `{ "nome":"Teste", "email":"teste@exemplo.com", "senha":"Senha12345" }`; retorna 201 e dados publicos do usuario.
- `POST /api/auth/login` — JSON `{ "email":"teste@exemplo.com", "senha":"Senha12345" }`; retorna JWT com validade de 1 hora.
- `GET /api/perfil` — header `Authorization: Bearer SEU_JWT`.
- `POST /api/auth/esqueci-senha` — JSON `{ "email":"teste@exemplo.com" }`; exige SMTP configurado.
- `POST /api/auth/redefinir-senha` — JSON `{ "token":"TOKEN_RECEBIDO", "novaSenha":"NovaSenha123" }`.

## Recuperacao por e-mail

Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM e APP_URL no `.env`. O link enviado aponta para `/redefinir-senha?token=...` no APP_URL; **o aplicativo frontend ainda precisa implementar essa tela** e enviar o token e a nova senha para a API. Sem SMTP, a solicitacao retorna HTTP 503, sem fingir que enviou um e-mail.

## Seguranca e limites

Senhas protegidas com bcrypt (custo 12); consultas parametrizadas; JWT de 1 hora e invalidacao apos troca de senha; tokens de recuperacao com hash SHA-256 e expiracao de 15 minutos; limite basico de requisicoes por IP. Para producao, adicionar HTTPS, CORS restrito ao frontend, proxy confiavel configurado corretamente, monitoramento, testes automatizados e limites de taxa persistentes em Redis ou similar. Nao registrar tokens nem credenciais nos logs. A versao atual e uma base academica para integracao, nao uma implantacao de producao auditada.

## Status de entrega

Codigo preparado para integrar com a tabela MySQL do colega. **Ainda depende** de acesso ao banco, execucao da migracao, configuracao SMTP e testes de ponta a ponta no ambiente do grupo. Nao alterar a branch `main` sem revisao do grupo.
