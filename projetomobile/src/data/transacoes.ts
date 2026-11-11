import { useSyncExternalStore } from 'react';

export type Tipo = 'receita' | 'despesa';

export type Categoria =
  | 'Moradia'
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Assinaturas'
  | 'Lazer'
  | 'Outros'
  | 'Freelance';

export type Transacao = {
  id: number;
  descricao: string;
  categoria: Categoria;
  valor: number;
  tipo: Tipo;
  data: string; // AAAA-MM-DD
};

export const CATEGORIAS: Record<Categoria, { sigla: string; cor: string }> = {
  Moradia: { sigla: 'MO', cor: '#E74797' },
  Alimentação: { sigla: 'AL', cor: '#D76619' },
  Transporte: { sigla: 'TR', cor: '#5F6E85' },
  Saúde: { sigla: 'SA', cor: '#14A99A' },
  Educação: { sigla: 'ED', cor: '#6366F1' },
  Assinaturas: { sigla: 'AS', cor: '#A554F2' },
  Lazer: { sigla: 'LA', cor: '#E93D5B' },
  Outros: { sigla: 'OU', cor: '#94A3B8' },
  Freelance: { sigla: 'FR', cor: '#7C6CF2' },
};

/** Categorias disponíveis na tela "Nova transação", por tipo. */
export const CATEGORIAS_POR_TIPO: Record<Tipo, Categoria[]> = {
  despesa: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Assinaturas', 'Lazer', 'Outros'],
  receita: ['Freelance', 'Outros'],
};

/* ===== Dados de exemplo (trocar pela API depois) ===== */
let transacoes: Transacao[] = [
  { id: 1, descricao: 'Cinema com amigos', categoria: 'Lazer', valor: 78, tipo: 'despesa', data: '2026-09-21' },
  { id: 2, descricao: 'Consulta médica', categoria: 'Saúde', valor: 155.8, tipo: 'despesa', data: '2026-09-20' },
  { id: 3, descricao: 'Venda notebook antigo', categoria: 'Outros', valor: 200, tipo: 'receita', data: '2026-09-19' },
  { id: 4, descricao: 'Mensalidade faculdade', categoria: 'Educação', valor: 540, tipo: 'despesa', data: '2026-09-18' },
  { id: 5, descricao: 'Combustível e Uber', categoria: 'Transporte', valor: 210, tipo: 'despesa', data: '2026-09-15' },
  { id: 6, descricao: 'Serviços streaming', categoria: 'Assinaturas', valor: 89.9, tipo: 'despesa', data: '2026-09-12' },
  { id: 7, descricao: 'Projeto UI design', categoria: 'Freelance', valor: 650, tipo: 'receita', data: '2026-09-10' },
  { id: 8, descricao: 'Aluguel', categoria: 'Moradia', valor: 1200, tipo: 'despesa', data: '2026-09-05' },
];

/* ===== Store mínima (em memória) ===== */
const ouvintes = new Set<() => void>();

const assinar = (ouvinte: () => void) => {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
};

const lerTransacoes = () => transacoes;

export function adicionarTransacao(nova: Omit<Transacao, 'id'>): Transacao {
  // TODO: trocar por POST na API; o id virá do backend
  const id = transacoes.reduce((maior, t) => Math.max(maior, t.id), 0) + 1;
  const criada: Transacao = { id, ...nova };
  transacoes = [criada, ...transacoes];
  ouvintes.forEach((ouvinte) => ouvinte());
  return criada;
}

export function useTransacoes(): Transacao[] {
  return useSyncExternalStore(assinar, lerTransacoes);
}
