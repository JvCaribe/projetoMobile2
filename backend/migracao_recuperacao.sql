USE finanza;
-- Extensao da tabela do colega para invalidar JWTs depois de trocar a senha.
ALTER TABLE usuarios ADD COLUMN versao_token INT NOT NULL DEFAULT 0;

-- Tokens armazenados somente como hash, nunca em texto puro.
CREATE TABLE IF NOT EXISTS recuperacoes_senha (
    token_hash CHAR(64) PRIMARY KEY,
    usuario_id INT NOT NULL,
    expira_em DATETIME NOT NULL,
    CONSTRAINT fk_recuperacoes_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_recuperacoes_usuario (usuario_id)
);
