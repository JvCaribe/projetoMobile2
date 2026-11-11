import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import React, { useMemo } from 'react';

import { CATEGORIAS, useTransacoes } from '../data/transacoes';
import type { Tipo } from '../data/transacoes';
import './TransacoesPorTipo.css';

type TransacoesPorTipoProps = {
  tipo: Tipo;
};

const TEXTOS: Record<
  Tipo,
  { titulo: string; total: string; vazio: string; sinal: string; leitura: string }
> = {
  receita: {
    titulo: 'Página de Receitas',
    total: 'TOTAL DE RECEITAS',
    vazio: 'Nenhuma receita registrada.',
    sinal: '+',
    leitura: 'Receita',
  },
  despesa: {
    titulo: 'Página de Despesas',
    total: 'TOTAL DE DESPESAS',
    vazio: 'Nenhuma despesa registrada.',
    sinal: '-',
    leitura: 'Despesa',
  },
};

const formatarNumero = (valor: number): string =>
  valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatarDia = (iso: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

/** Página compartilhada: lista só as receitas ou só as despesas, com o total. */
const TransacoesPorTipo: React.FC<TransacoesPorTipoProps> = ({ tipo }) => {
  const router = useIonRouter();
  const todas = useTransacoes();
  const texto = TEXTOS[tipo];

  const itens = useMemo(
    () => todas.filter((t) => t.tipo === tipo).sort((a, b) => b.data.localeCompare(a.data)),
    [todas, tipo],
  );
  const total = itens.reduce((soma, t) => soma + t.valor, 0);
  const quantidade = `${itens.length} ${itens.length === 1 ? 'transação' : 'transações'}`;

  const voltar = () => {
    if (router.canGoBack()) router.goBack();
    else router.push('/dashboard', 'back');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="tipo-content">
        <main className={`tipo tipo--${tipo}`}>
          <header className="tipo__cabecalho">
            <button type="button" className="tipo__voltar" aria-label="Voltar" onClick={voltar}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <h1 className="tipo__titulo">{texto.titulo}</h1>
          </header>

          <section className="tipo__resumo" aria-label={texto.total.toLowerCase()}>
            <p className="tipo__resumo-rotulo">{texto.total}</p>
            <p className="tipo__resumo-valor">R$ {formatarNumero(total)}</p>
            <p className="tipo__resumo-qtd">{quantidade}</p>
          </section>

          {itens.length === 0 ? (
            <p className="tipo__vazio">{texto.vazio}</p>
          ) : (
            <ul className="tipo__lista" aria-label={tipo === 'receita' ? 'Receitas' : 'Despesas'}>
              {itens.map((t) => {
                const { sigla, cor } = CATEGORIAS[t.categoria];
                const valor = formatarNumero(t.valor);
                return (
                  <li key={t.id} className="tipo__item">
                    <span
                      className="tipo__tile"
                      style={{ color: cor, backgroundColor: `${cor}2E` }}
                      aria-hidden="true"
                    >
                      {sigla}
                    </span>

                    <div className="tipo__info">
                      <p className="tipo__nome">{t.descricao}</p>
                      <p className="tipo__meta">
                        {t.categoria} · {formatarDia(t.data)}
                      </p>
                    </div>

                    <span className="tipo__valor">
                      <span aria-hidden="true">
                        {texto.sinal}R$ {valor}
                      </span>
                      <span className="tipo__sr">
                        {texto.leitura} de R$ {valor}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
};

export default TransacoesPorTipo;
