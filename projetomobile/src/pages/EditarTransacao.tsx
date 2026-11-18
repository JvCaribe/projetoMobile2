import { IonContent, IonPage } from '@ionic/react';
import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import {
  atualizarTransacao,
  CATEGORIAS,
  CATEGORIAS_POR_TIPO,
  useTransacoes,
} from '../data/transacoes';
import type { Categoria, Tipo } from '../data/transacoes';
import './NovaTransacao.css';

const MAX_DIGITOS = 9;

const TIPOS: { id: Tipo; rotulo: string }[] = [
  { id: 'despesa', rotulo: 'Despesa' },
  { id: 'receita', rotulo: 'Receita' },
];

const formatarCentavos = (centavos: number): string =>
  (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EditarTransacao: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const transacoes = useTransacoes();
  const transacao = transacoes.find((t) => t.id === Number(id));

  const [tipo, setTipo] = useState<Tipo>(transacao?.tipo ?? 'despesa');
  const [centavos, setCentavos] = useState(
    transacao ? Math.round(transacao.valor * 100) : 0,
  );
  const [categoria, setCategoria] = useState<Categoria | null>(
    transacao?.categoria ?? null,
  );
  const [descricao, setDescricao] = useState(transacao?.descricao ?? '');
  const [data, setData] = useState(transacao?.data ?? '');

  if (!transacao) return <Navigate to="/transacoes" replace />;

  const formularioValido =
    centavos > 0 && categoria !== null && descricao.trim().length > 0 && data !== '';

  const voltar = () =>
    navigate(`/transacoes/${transacao.id}`, { replace: true });

  const trocarTipo = (novo: Tipo) => {
    setTipo(novo);
    
    setCategoria((atual) =>
      atual && CATEGORIAS_POR_TIPO[novo].includes(atual) ? atual : null,
    );
  };

  const aoDigitarValor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitos = e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITOS);
    setCentavos(digitos ? Number(digitos) : 0);
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido || categoria === null) return;

    atualizarTransacao(transacao.id, {
      descricao: descricao.trim(),
      categoria,
      tipo,
      valor: centavos / 100,
      data,
    });
    voltar();
  };

  return (
    <IonPage>
      <IonContent fullscreen className="nova-content">
        <main className="nova">
          <header className="nova__cabecalho">
            <button type="button" className="nova__voltar" aria-label="Voltar" onClick={voltar}>
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
            <h1 className="nova__titulo">Editar Transação</h1>
          </header>

          <form className="nova__form" noValidate onSubmit={salvar}>
            {/* Tipo */}
            <div className="nova__tipos" role="group" aria-label="Tipo de transação">
              {TIPOS.map(({ id: tipoId, rotulo }) => (
                <button
                  key={tipoId}
                  type="button"
                  className={`nova__tipo nova__tipo--${tipoId} ${tipo === tipoId ? 'nova__tipo--ativo' : ''}`}
                  aria-pressed={tipo === tipoId}
                  onClick={() => trocarTipo(tipoId)}
                >
                  {rotulo}
                </button>
              ))}
            </div>

            {/* Valor */}
            <section className={`nova__valor nova__valor--${tipo}`} aria-label="Valor">
              <label className="nova__rotulo nova__rotulo--centro" htmlFor="valor">
                VALOR
              </label>
              <div className="nova__valor-linha">
                <span className="nova__moeda" aria-hidden="true">
                  R$
                </span>
                <input
                  id="valor"
                  className={`nova__valor-input ${centavos === 0 ? 'nova__valor-input--vazio' : ''}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatarCentavos(centavos)}
                  onChange={aoDigitarValor}
                  aria-label="Valor da transação em reais"
                />
              </div>
            </section>

            {/* Categoria */}
            <p className="nova__rotulo" id="rotulo-categoria">
              CATEGORIA
            </p>
            <div className="nova__chips" role="group" aria-labelledby="rotulo-categoria">
              {CATEGORIAS_POR_TIPO[tipo].map((nome) => {
                const ativo = categoria === nome;
                return (
                  <button
                    key={nome}
                    type="button"
                    className={`nova__chip ${ativo ? 'nova__chip--ativo' : ''}`}
                    style={{ ['--c' as string]: CATEGORIAS[nome].cor }}
                    aria-pressed={ativo}
                    onClick={() => setCategoria(nome)}
                  >
                    {nome}
                  </button>
                );
              })}
            </div>

            {/* Descrição */}
            <label className="nova__rotulo" htmlFor="descricao">
              DESCRIÇÃO
            </label>
            <input
              id="descricao"
              className="nova__input"
              type="text"
              maxLength={60}
              autoComplete="off"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            {/* Data */}
            <label className="nova__rotulo" htmlFor="data">
              DATA
            </label>
            <input
              id="data"
              className="nova__input nova__input--data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />

            <button type="submit" className="nova__salvar" disabled={!formularioValido}>
              Salvar Alteração
            </button>
          </form>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default EditarTransacao;
