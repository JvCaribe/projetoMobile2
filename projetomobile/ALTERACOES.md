# Registro de alterações – Finanza (`projetomobile`)

Os caminhos abaixo são relativos a `projetomobile/`. Copie os arquivos do zip para as mesmas pastas (mantendo `src/data/` ao lado de `src/pages/`).

## 1. Barra de navegação da página de Transações com escala menor

**Problema:** na aba Transações a barra aparecia menor que em Dashboard e Configurações.
**Causa:** `Transacoes.css` redefinia `.config-nav` e `.nav-item` com fonte de 10.5px e altura fixa de 60px, em vez de usar as regras globais de `Configuracoes.css` (fonte de 12px, itens de 52px, padding de 8px).

**Arquivos alterados**
- `src/pages/Transacoes.css`
  - Removidas as regras de tamanho, espaçamento e fonte da barra. Ficaram só o posicionamento fixo e as cores da tela.
  - `--nav-h` passou de `60px` para `calc(69px + env(safe-area-inset-bottom, 0px))`, a altura real da barra global (8 + 52 + 8 + borda), para o conteúdo não ficar atrás dela.

## 2. Nova tela "Nova Transação" (`/transacoes/nova`)

Aberta pelo botão "+" da página de Transações, seguindo o wireframe enviado.

**Arquivos novos**
- `src/pages/NovaTransacao.tsx`
  - Alternância Despesa / Receita (cores vermelha e verde).
  - Campo de valor com máscara de moeda (digita só números e eles preenchem da direita para a esquerda; `4200` vira `42,00`).
  - Chips de categoria com a cor da categoria quando selecionados.
  - Descrição (até 60 caracteres) e data (começa em hoje).
  - Botão "Salvar Transação" desabilitado até haver valor maior que zero, categoria, descrição e data.
  - Ao salvar, adiciona a transação e volta para `/transacoes`.
- `src/pages/NovaTransacao.css`: estilos da tela, usando os tokens `--cor-*` (tema claro e escuro).
- `src/data/transacoes.ts`: tipos (`Tipo`, `Categoria`, `Transacao`), `CATEGORIAS`, `CATEGORIAS_POR_TIPO`, dados de exemplo e uma store mínima em memória (`adicionarTransacao`, `useTransacoes`).

**Arquivos alterados**
- `src/pages/Transacoes.tsx`: tipos, `CATEGORIAS` e a lista fixa saíram daqui; passa a ler as transações com `useTransacoes()`. Removidos os exports `CATEGORIAS`, `TRANSACOES` e `Transacao`.
- `src/pages/DetalhesTransacoes.tsx`: importa de `../data/transacoes` e usa `useTransacoes()` no lugar de `TRANSACOES`.
- `src/App.tsx`: nova rota `/transacoes/nova`, declarada antes de `/transacoes/:id`.

**Decisões e limitações**
- As transações novas ficam **só em memória**; somem ao recarregar. Há um TODO em `adicionarTransacao` para trocar por um POST na API.
- Categorias de receita (não constam no wireframe): Salário, Freelance, Outros. Para mudar, edite `CATEGORIAS_POR_TIPO`. "Salário" (sigla `SL`) foi adicionada a `CATEGORIAS`.
- O Dashboard continua com dados fixos próprios e não reflete as novas transações.
- Não foi possível rodar `build` nem testes neste ambiente (sem `node_modules`); conferir com `npm run build`.
