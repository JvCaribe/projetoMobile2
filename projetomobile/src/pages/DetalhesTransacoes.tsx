
import { IonPage } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CATEGORIAS, CATEGORIAS_POR_TIPO } from '../data/transacoes';
import type { Categoria, Tipo, Transacao } from '../data/transacoes';
import { useAviso } from '../hooks/useAviso';
import './DetalhesTransacoes.css';

type DadosEdicao = {
  descricao: string;
  categoria: Categoria;
  tipo: Tipo;
  valor: string;
  data: string;
};

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

const campoEstilo: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: '14px',
};

const rotuloEstilo: React.CSSProperties = {
  display: 'grid',
  gap: '5px',
  width: '100%',
  fontSize: '13px',
};

// Comunicacao com o backend de Danilo
async function chamarAPI<T>(
  caminho: string,
  metodo: 'GET' | 'PUT' | 'DELETE' = 'GET',
  corpo?: unknown
): Promise<T> {
  const token = sessionStorage.getItem('finanza_token');

  if (!token) {
    throw new Error('Sessão encerrada. Faça login novamente.');
  }

  const resposta = await fetch(`http://localhost:3000${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(corpo !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem =
      dados &&
      typeof dados === 'object' &&
      typeof dados.mensagem === 'string'
        ? dados.mensagem
        : `Erro na API (${resposta.status}).`;

    throw new Error(mensagem);
  }

  return dados as T;
}

const DetalhesTransacoes: React.FC = () => {
  const navigate = useNavigate();
  const aviso = useAviso();
  const { id } = useParams<{ id: string }>();

  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [edicao, setEdicao] = useState<DadosEdicao>({
    descricao: '',
    categoria: 'Outros',
    tipo: 'despesa',
    valor: '',
    data: '',
  });

  const botaoNao = useRef<HTMLButtonElement>(null);

  // Buscar os detalhes reais da transacao
  useEffect(() => {
    let ativo = true;

    const carregarDetalhes = async () => {
      setCarregando(true);
      setErro('');
      setTransacao(null);

      try {
        if (!id || !/^\d+$/.test(id)) {
          throw new Error('Identificador de transação inválido.');
        }

        const dados = await chamarAPI<Transacao>(
          `/api/transacoes/${id}`
        );

        if (ativo) {
          setTransacao({
            ...dados,
            valor: Number(dados.valor),
            data: String(dados.data).slice(0, 10),
          });
        }
      } catch (erro) {
        if (ativo) {
          setErro(
            erro instanceof Error
              ? erro.message
              : 'Erro ao carregar a transação.'
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void carregarDetalhes();

    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (!confirmando && !editando) return;

    if (confirmando) botaoNao.current?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !excluindo && !salvando) {
        setConfirmando(false);
        setEditando(false);
      }
    };

    window.addEventListener('keydown', aoTeclar);

    return () => window.removeEventListener('keydown', aoTeclar);
  }, [confirmando, editando, excluindo, salvando]);

  const voltar = () => navigate('/transacoes');

  const abrirEdicao = () => {
    if (!transacao) return;

    setEdicao({
      descricao: transacao.descricao,
      categoria: transacao.categoria,
      tipo: transacao.tipo,
      valor: String(transacao.valor),
      data: transacao.data,
    });

    setEditando(true);
  };

  // Salvar as alteracoes no MySQL
  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transacao || salvando) return;

    const valor = Number(edicao.valor.replace(',', '.'));

    if (
      !edicao.descricao.trim() ||
      !Number.isFinite(valor) ||
      valor <= 0 ||
      !edicao.categoria ||
      !edicao.data
    ) {
      aviso.erro('Preencha todos os campos corretamente.');
      return;
    }

    setSalvando(true);

    try {
      const dados = await chamarAPI<Transacao>(
        `/api/transacoes/${transacao.id}`,
        'PUT',
        {
          descricao: edicao.descricao.trim(),
          categoria: edicao.categoria,
          tipo: edicao.tipo,
          valor,
          data: edicao.data,
        }
      );

      setTransacao({
        ...dados,
        valor: Number(dados.valor),
        data: String(dados.data).slice(0, 10),
      });

      setEditando(false);
      aviso.sucesso('Transação atualizada com sucesso!');
    } catch (erro) {
      aviso.erro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível editar a transação.'
      );
    } finally {
      setSalvando(false);
    }
  };

  // Exclusao logica pelo backend
  const excluir = async () => {
    if (!transacao || excluindo) return;

    setExcluindo(true);

    try {
      await chamarAPI<{ mensagem: string }>(
        `/api/transacoes/${transacao.id}`,
        'DELETE'
      );

      setConfirmando(false);
      aviso.sucesso('Transação excluída com sucesso!');
      navigate('/transacoes', { replace: true });
    } catch (erro) {
      aviso.erro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível excluir a transação.'
      );
    } finally {
      setExcluindo(false);
    }
  };

  if (carregando) {
    return (
      <IonPage>
        <div className="tela-detalhe">
          <main className="detalhe">
            <p>Carregando transação...</p>
          </main>
        </div>
      </IonPage>
    );
  }

  if (erro || !transacao) {
    return (
      <IonPage>
        <div className="tela-detalhe">
          <main className="detalhe">
            <h1>Não foi possível abrir a transação</h1>
            <p role="alert">
              {erro || 'Transação não encontrada.'}
            </p>
            <button
              type="button"
              className="botao-acao botao-acao--editar"
              onClick={voltar}
            >
              Voltar ao histórico
            </button>
          </main>
        </div>
      </IonPage>
    );
  }

  const { descricao, categoria, tipo, valor, data } = transacao;
  const { sigla, cor } =
    CATEGORIAS[categoria] ?? CATEGORIAS.Outros;

  const ehReceita = tipo === 'receita';

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
            <h1 className="detalhe__titulo">Transação</h1>
          </header>

          <section className="detalhe-card">
            <div className="detalhe-card__topo">
              <span
                className="detalhe-card__icone"
                style={{
                  color: cor,
                  backgroundColor: `${cor}2E`,
                }}
                aria-hidden="true"
              >
                {sigla}
              </span>

              <div className="detalhe-card__texto">
                <h2 className="detalhe-card__nome">
                  {descricao}
                </h2>
                <p className="detalhe-card__categoria">
                  {categoria}
                </p>
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
            onClick={abrirEdicao}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
              <path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12 14.6 8 15.5l.9-4z" />
            </svg>
            Editar Transação
          </button>

          <button
            type="button"
            className="botao-acao botao-acao--excluir"
            onClick={() => setConfirmando(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M9 7V4h6v3" />
              <path d="M6 7l1 13h10l1-13" />
            </svg>
            Excluir Transação
          </button>
        </main>

        {editando && (
          <div
            className="confirmar"
            onClick={() => {
              if (!salvando) setEditando(false);
            }}
          >
            <form
              className="confirmar__folha"
              role="dialog"
              aria-modal="true"
              aria-labelledby="editar-titulo"
              style={{
                alignItems: 'stretch',
                gap: '10px',
                maxHeight: '90%',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={salvarEdicao}
            >
              <h2
                id="editar-titulo"
                className="confirmar__titulo"
              >
                Editar Transação
              </h2>

              <label style={rotuloEstilo}>
                Descrição
                <input
                  style={campoEstilo}
                  maxLength={60}
                  required
                  value={edicao.descricao}
                  onChange={(e) =>
                    setEdicao({
                      ...edicao,
                      descricao: e.target.value,
                    })
                  }
                />
              </label>

              <label style={rotuloEstilo}>
                Valor (R$)
                <input
                  style={campoEstilo}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={edicao.valor}
                  onChange={(e) =>
                    setEdicao({
                      ...edicao,
                      valor: e.target.value,
                    })
                  }
                />
              </label>

              <label style={rotuloEstilo}>
                Tipo
                <select
                  style={campoEstilo}
                  value={edicao.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as Tipo;

                    setEdicao({
                      ...edicao,
                      tipo: novoTipo,
                      categoria: CATEGORIAS_POR_TIPO[novoTipo][0],
                    });
                  }}
                >
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </label>

              <label style={rotuloEstilo}>
                Categoria
                <select
                  style={campoEstilo}
                  value={edicao.categoria}
                  onChange={(e) =>
                    setEdicao({
                      ...edicao,
                      categoria: e.target.value as Categoria,
                    })
                  }
                >
                  {!CATEGORIAS_POR_TIPO[edicao.tipo].includes(
                    edicao.categoria
                  ) && (
                    <option value={edicao.categoria}>
                      {edicao.categoria}
                    </option>
                  )}

                  {CATEGORIAS_POR_TIPO[edicao.tipo].map(
                    (nome) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label style={rotuloEstilo}>
                Data
                <input
                  style={campoEstilo}
                  type="date"
                  required
                  value={edicao.data}
                  onChange={(e) =>
                    setEdicao({
                      ...edicao,
                      data: e.target.value,
                    })
                  }
                />
              </label>

              <div className="confirmar__acoes">
                <button
                  type="button"
                  className="confirmar__botao confirmar__botao--nao"
                  disabled={salvando}
                  onClick={() => setEditando(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="confirmar__botao confirmar__botao--sim"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {confirmando && (
          <div
            className="confirmar"
            onClick={() => {
              if (!excluindo) setConfirmando(false);
            }}
          >
            <div
              className="confirmar__folha"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirmar-titulo"
              aria-describedby="confirmar-texto"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="confirmar__icone"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.3 4.2 2.9 17.1A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.9L13.7 4.2a2 2 0 0 0-3.4 0z" />
                  <path d="M12 9.5v4" />
                  <path d="M12 16.8h.01" />
                </svg>
              </span>

              <h2
                id="confirmar-titulo"
                className="confirmar__titulo"
              >
                Confirmar exclusão?
              </h2>

              <p
                id="confirmar-texto"
                className="confirmar__texto"
              >
                Esta ação não pode ser desfeita no aplicativo.
              </p>

              <div className="confirmar__acoes">
                <button
                  ref={botaoNao}
                  type="button"
                  className="confirmar__botao confirmar__botao--nao"
                  disabled={excluindo}
                  onClick={() => setConfirmando(false)}
                >
                  Não
                </button>

                <button
                  type="button"
                  className="confirmar__botao confirmar__botao--sim"
                  disabled={excluindo}
                  onClick={() => void excluir()}
                >
                  {excluindo ? 'Excluindo...' : 'Sim, excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </IonPage>
  );
};

export default DetalhesTransacoes;
