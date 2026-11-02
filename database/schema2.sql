-- BANCO DE DADOS: FINANZA

CREATE DATABASE IF NOT EXISTS finanza;

USE finanza;


-- TABELA: USUARIOS


CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL
);


-- TABELA: CATEGORIAS 


CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,

    CONSTRAINT fk_categorias_usuarios
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
);


-- CATEGORIAS PADRAO 


INSERT INTO categorias (nome, tipo, usuario_id)
VALUES
    ('Moradia', 'despesa', NULL),
    ('Alimentação', 'despesa', NULL),
    ('Transporte', 'despesa', NULL),
    ('Saúde', 'despesa', NULL),
    ('Educação', 'despesa', NULL),
    ('Assinaturas', 'despesa', NULL),
    ('Lazer', 'despesa', NULL),
    ('Outros', 'despesa', NULL),
    ('Salário', 'receita', NULL),
    ('Freelance', 'receita', NULL),
    ('Investimentos', 'receita', NULL),
    ('Vendas', 'receita', NULL),
    ('Outros', 'receita', NULL);


-- TABELA: TRANSACOES 


CREATE TABLE IF NOT EXISTS transacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(255),
    data_transacao DATE NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transacoes_usuarios
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_transacoes_categorias
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id),

    CONSTRAINT chk_transacoes_valor
        CHECK (valor > 0)
);
