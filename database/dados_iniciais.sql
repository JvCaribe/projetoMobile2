-- OBS: Esse arquivo deve ser executado depois do schema.sql <-------------------------

-- Categorias Padrão

USE finanza;

INSERT INTO categorias (nome, tipo, usuario_id)
SELECT dados.nome, dados.tipo, NULL
FROM (
    SELECT 'Moradia' AS nome, 'despesa' AS tipo
    UNION ALL SELECT 'Alimentação', 'despesa'
    UNION ALL SELECT 'Transporte', 'despesa'
    UNION ALL SELECT 'Saúde', 'despesa'
    UNION ALL SELECT 'Educação', 'despesa'
    UNION ALL SELECT 'Assinaturas', 'despesa'
    UNION ALL SELECT 'Lazer', 'despesa'
    UNION ALL SELECT 'Outros', 'despesa'
    UNION ALL SELECT 'Salário', 'receita'
    UNION ALL SELECT 'Freelance', 'receita'
    UNION ALL SELECT 'Investimentos', 'receita'
    UNION ALL SELECT 'Vendas', 'receita'
    UNION ALL SELECT 'Outros', 'receita'
) AS dados
WHERE NOT EXISTS (
    SELECT 1
    FROM categorias c
    WHERE c.nome = dados.nome
      AND c.tipo = dados.tipo
      AND c.usuario_id IS NULL
);