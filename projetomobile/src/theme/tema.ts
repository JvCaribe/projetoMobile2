/**
 * Tema do app (claro/escuro).
 * O tema escolhido fica salvo em localStorage e é aplicado no <html>
 * (atributo data-tema) assim que o app abre, valendo para todas as telas.
 */
export type Tema = 'claro' | 'escuro';

export const CHAVE_TEMA = 'finanza-tema';
export const TEMA_PADRAO: Tema = 'escuro';

export function lerTemaSalvo(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch {
    /* localStorage indisponível: usa o padrão */
  }
  return TEMA_PADRAO;
}

export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement;
  raiz.setAttribute('data-tema', tema);
  // Faz scrollbars, seletor de data e controles nativos seguirem o tema escolhido
  raiz.style.colorScheme = tema === 'claro' ? 'light' : 'dark';
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* ignora */
  }
}
