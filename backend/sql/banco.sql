-- =====================================================================
-- BANCO DE DADOS DO FINANZA
-- Script unico para criar o banco usado pelo backend.
-- Baseado nos arquivos da pasta /database (schema, dados iniciais e
-- exclusao logica), reunidos aqui para rodar de uma vez so.
--
-- Como usar: abra no MySQL Workbench e execute tudo (raio).
-- =====================================================================

-- Garante que os acentos (Saúde, Educação...) sejam gravados corretamente
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS finanza
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finanza;

-- ---------------------------------------------------------------------
-- USUARIOS: quem usa o app. A senha fica guardada como hash (bcrypt),
-- nunca em texto puro.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- CATEGORIAS: cada categoria e de um tipo ('receita' ou 'despesa').
-- usuario_id NULL = categoria padrao, disponivel para todos.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT NULL,
    nome        VARCHAR(100) NOT NULL,
    tipo        VARCHAR(20)  NOT NULL,

    CONSTRAINT fk_categorias_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    CONSTRAINT chk_categorias_tipo
        CHECK (tipo IN ('receita', 'despesa'))
);

-- ---------------------------------------------------------------------
-- TRANSACOES: cada receita ou despesa lancada pelo usuario.
-- O tipo (receita/despesa) vem da categoria escolhida.
-- excluido_em: exclusao logica. Ao "excluir", so preenchemos a data;
-- o registro continua no banco, mas some das consultas.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transacoes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT NOT NULL,
    categoria_id    INT NOT NULL,
    valor           DECIMAL(10,2) NOT NULL,
    descricao       VARCHAR(255),
    data_transacao  DATE NOT NULL,
    criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
    excluido_em     DATETIME NULL,

    CONSTRAINT fk_transacoes_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),

    CONSTRAINT fk_transacoes_categorias
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),

    CONSTRAINT chk_transacoes_valor
        CHECK (valor > 0),

    -- Indice para deixar rapida a busca "transacoes do usuario X por data"
    INDEX idx_transacoes_usuario_data (usuario_id, data_transacao)
);

-- ---------------------------------------------------------------------
-- CATEGORIAS PADRAO (as mesmas usadas nas telas do app)
-- O WHERE NOT EXISTS evita duplicar se o script rodar duas vezes.
-- ---------------------------------------------------------------------
INSERT INTO categorias (nome, tipo, usuario_id)
SELECT dados.nome, dados.tipo, NULL
FROM (
              SELECT 'Moradia'      AS nome, 'despesa' AS tipo
    UNION ALL SELECT 'Alimentação',  'despesa'
    UNION ALL SELECT 'Transporte',   'despesa'
    UNION ALL SELECT 'Saúde',        'despesa'
    UNION ALL SELECT 'Educação',     'despesa'
    UNION ALL SELECT 'Assinaturas',  'despesa'
    UNION ALL SELECT 'Lazer',        'despesa'
    UNION ALL SELECT 'Outros',       'despesa'
    UNION ALL SELECT 'Salário',      'receita'
    UNION ALL SELECT 'Freelance',    'receita'
    UNION ALL SELECT 'Investimentos','receita'
    UNION ALL SELECT 'Vendas',       'receita'
    UNION ALL SELECT 'Outros',       'receita'
) AS dados
WHERE NOT EXISTS (
    SELECT 1 FROM categorias c
    WHERE c.nome = dados.nome
      AND c.tipo = dados.tipo
      AND c.usuario_id IS NULL
);
