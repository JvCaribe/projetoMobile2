import { IonPage } from '@ionic/react';
import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { CATEGORIAS, TRANSACOES } from './Transacoes';
import './DetalhesTransacoes.css';

const formatarValor = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatarDia = (iso: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });

const DetalhesTransacoes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const transacao = TRANSACOES.find((t) => t.id === Number(id));

  /* Id inexistente: volta para a lista */
  if (!transacao) return <Navigate to="/transacoes" replace />;

  const { descricao, categoria, tipo, valor, data } = transacao;
  const { sigla, cor } = CATEGORIAS[categoria];
  const ehReceita = tipo === 'receita';

  const voltar = () => navigate('/transacoes');

  const editar = () => {
    // TODO: abrir a tela/modal de edição
    console.log('editar', transacao);
  };

  const excluir = () => {
    // TODO: remover a transação do seu estado/storage
    console.log('excluir', transacao);
    navigate('/transacoes', { replace: true });
  };

  return (
    <IonPage>
      <div className="tela-detalhe">
        <main className="detalhe">
          <header className="detalhe__cabecalho">
            <button
              type="button"
              className="botao-voltar"
              onClick={voltar}
              aria-label="Voltar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <h1 className="detalhe__titulo">Transação</h1>
          </header>

          <section className="detalhe-card">
            <div className="detalhe-card__topo">
              <span
                className="detalhe-card__icone"
                style={{ color: cor, backgroundColor: `${cor}2E` }}
                aria-hidden="true"
              >
                {sigla}
              </span>
              <div className="detalhe-card__texto">
                <h2 className="detalhe-card__nome">{descricao}</h2>
                <p className="detalhe-card__categoria">{categoria}</p>
              </div>
            </div>

            <p
              className={`detalhe-card__valor detalhe-card__valor--${tipo}`}
            >
              {ehReceita ? '+' : '-'}R$ {formatarValor(valor)}
            </p>

            <dl className="detalhe-card__lista">
              <div className="detalhe-card__linha">
                <dt>Tipo</dt>
                <dd>{ehReceita ? 'Receita' : 'Despesa'}</dd>
              </div>
              <div className="detalhe-card__linha">
                <dt>Data</dt>
                <dd>{formatarDia(data)}</dd>
              </div>
              <div className="detalhe-card__linha">
                <dt>Categoria</dt>
                <dd>{categoria}</dd>
              </div>
            </dl>
          </section>

          <button
            type="button"
            className="botao-acao botao-acao--editar"
            onClick={editar}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
              <path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12 14.6 8 15.5l.9-4z" />
            </svg>
            Editar Transação
          </button>

          <button
            type="button"
            className="botao-acao botao-acao--excluir"
            onClick={excluir}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16" />
              <path d="M9 7V4h6v3" />
              <path d="M6 7l1 13h10l1-13" />
            </svg>
            Excluir Transação
          </button>
        </main>
      </div>
    </IonPage>
  );
};

export default DetalhesTransacoes;