
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
} from '@ionic/react';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  arrowDownOutline,
  arrowUpOutline,
  eyeOffOutline,
  eyeOutline,
} from 'ionicons/icons';

import BarraNavegacao from '../components/BarraNavegacao';
import { CATEGORIAS } from '../data/transacoes';
import type { Categoria, Transacao } from '../data/transacoes';

import './Dashboard.css';

const API = 'http://localhost:3000';

type ResumoAPI = {
  saldo: number;
  receitas: number;
  despesas: number;
  despesasPorCategoria: {
    nome: string;
    valor: number;
  }[];
};

type UsuarioAPI = {
  id: number;
  nome: string;
  email: string;
};

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const moeda = (valor: number): string => brl.format(valor);

const movimento = (valor: number): string =>
  `${valor < 0 ? '-' : '+'}${moeda(Math.abs(valor))}`;

const formatarData = (iso: string): string =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString(
    'pt-BR',
    {
      day: 'numeric',
      month: 'short',
    }
  );

const obterCategoria = (nome: string) =>
  CATEGORIAS[nome as Categoria] ?? CATEGORIAS.Outros;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
  const [resumo, setResumo] = useState<ResumoAPI | null>(null);
  const [recentes, setRecentes] = useState<Transacao[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Buscar as informacoes reais no backend do Danilo
  useEffect(() => {
    const controller = new AbortController();

    const carregarDashboard = async () => {
      const token = sessionStorage.getItem('finanza_token');

      if (!token) {
        setErro('Faça login para acessar o Dashboard.');
        setCarregando(false);
        return;
      }

      try {
        const buscar = async (rota: string) => {
          const resposta = await fetch(`${API}${rota}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          const dados = await resposta.json().catch(() => null);

          if (!resposta.ok) {
            if (resposta.status === 401) {
              throw new Error(
                'Sua sessão expirou. Faça login novamente.'
              );
            }

            throw new Error(
              dados?.mensagem ||
                `Erro ao carregar ${rota} (${resposta.status}).`
            );
          }

          return dados;
        };

        const [dadosResumo, dadosTransacoes, dadosUsuario] =
          await Promise.all([
            buscar('/api/resumo'),
            buscar('/api/transacoes'),
            buscar('/api/usuario/perfil'),
          ]);

        if (
          !dadosResumo ||
          !Array.isArray(dadosResumo.despesasPorCategoria) ||
          !Array.isArray(dadosTransacoes) ||
          !dadosUsuario?.nome
        ) {
          throw new Error('Resposta inesperada do servidor.');
        }

        const resumoFormatado: ResumoAPI = {
          saldo: Number(dadosResumo.saldo),
          receitas: Number(dadosResumo.receitas),
          despesas: Number(dadosResumo.despesas),
          despesasPorCategoria:
            dadosResumo.despesasPorCategoria.map(
              (categoria: { nome: string; valor: number }) => ({
                nome: categoria.nome,
                valor: Number(categoria.valor),
              })
            ),
        };

        const transacoesFormatadas: Transacao[] =
          dadosTransacoes.map((item: Transacao) => ({
            ...item,
            valor: Number(item.valor),
            data: String(item.data).slice(0, 10),
          }));

        transacoesFormatadas.sort(
          (a, b) =>
            b.data.localeCompare(a.data) ||
            Number(b.id) - Number(a.id)
        );

        if (controller.signal.aborted) return;

        setUsuario(dadosUsuario);
        setResumo(resumoFormatado);
        setRecentes(transacoesFormatadas.slice(0, 3));
        setErro('');
      } catch (erro) {
        if (controller.signal.aborted) return;

        console.error('Erro ao carregar Dashboard:', erro);

        setErro(
          erro instanceof Error
            ? erro.message
            : 'Não foi possível carregar o Dashboard.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    };

    void carregarDashboard();

    return () => controller.abort();
  }, []);

  const nomeUsuario = usuario?.nome || 'Usuário';

  const primeiroNome = nomeUsuario.split(' ')[0];

  const iniciais = nomeUsuario
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const receitas = resumo?.receitas ?? 0;
  const despesas = resumo?.despesas ?? 0;
  const saldo = resumo?.saldo ?? 0;

  const categorias = resumo?.despesasPorCategoria ?? [];

  const maior = Math.max(receitas, despesas, 1);

  return (
    <IonPage>
      <IonContent fullscreen className="dash-content">
        <main className="dash">

          {carregando && (
            <p role="status">Carregando Dashboard...</p>
          )}

          {erro && (
            <div role="alert">
              <p>{erro}</p>

              <button
                type="button"
                onClick={() => navigate('/login')}
              >
                Ir para login
              </button>
            </div>
          )}

          {!carregando && !erro && resumo && (
            <>
              {/* Cabecalho */}
              <header className="dash__header">
                <div>
                  <p className="dash__hello">
                    OLÁ, {primeiroNome.toUpperCase()}
                  </p>
                  <h1>Dashboard Financeiro</h1>
                </div>

                <div
                  className="dash__avatar"
                  aria-label={`Usuário ${nomeUsuario}`}
                >
                  {iniciais}
                </div>
              </header>

              {/* Saldo total */}
              <section
                className="dash__balance"
                aria-label="Saldo total"
              >
                <p className="dash__balance-label">
                  SALDO TOTAL
                </p>

                <button
                  type="button"
                  className="dash__eye"
                  aria-label={
                    mostrarSaldo
                      ? 'Ocultar saldo'
                      : 'Mostrar saldo'
                  }
                  onClick={() => setMostrarSaldo((v) => !v)}
                >
                  <IonIcon
                    icon={
                      mostrarSaldo
                        ? eyeOutline
                        : eyeOffOutline
                    }
                  />
                </button>

                <p className="dash__balance-value">
                  {mostrarSaldo ? moeda(saldo) : 'R$ ••••••'}
                </p>

                <p className="dash__balance-period">
                  Todas as transações
                </p>
              </section>

              {/* Receitas vs despesas */}
              <section className="dash__card">
                <h2 className="dash__card-title">
                  RECEITAS VS DESPESAS
                </h2>

                <div className="dash__flow">
                  <div className="dash__flow-head">
                    <span className="dash__flow-name dash__flow-name--in">
                      Receitas
                    </span>

                    <span className="dash__mono dash__mono--in">
                      {moeda(receitas)}
                    </span>
                  </div>

                  <div className="dash__track" aria-hidden="true">
                    <div
                      className="dash__fill dash__fill--in"
                      style={{
                        width: `${(receitas / maior) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="dash__flow">
                  <div className="dash__flow-head">
                    <span className="dash__flow-name dash__flow-name--out">
                      Despesas
                    </span>

                    <span className="dash__mono dash__mono--out">
                      {moeda(despesas)}
                    </span>
                  </div>

                  <div className="dash__track" aria-hidden="true">
                    <div
                      className="dash__fill dash__fill--out"
                      style={{
                        width: `${(despesas / maior) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="dash__actions">
                  <button
                    type="button"
                    className="dash__action dash__action--in"
                    onClick={() => navigate('/receitas')}
                  >
                    <IonIcon icon={arrowUpOutline} />
                    Ver Receitas
                  </button>

                  <button
                    type="button"
                    className="dash__action dash__action--out"
                    onClick={() => navigate('/despesas')}
                  >
                    <IonIcon icon={arrowDownOutline} />
                    Ver Despesas
                  </button>
                </div>
              </section>

              {/* Despesas por categoria */}
              <section className="dash__card">
                <h2 className="dash__card-title">
                  DESPESAS POR CATEGORIA
                </h2>

                {categorias.length === 0 && (
                  <p>Nenhuma despesa cadastrada.</p>
                )}

                <ul className="dash__cats">
                  {categorias.map((c) => {
                    const cor = obterCategoria(c.nome).cor;

                    const percentual =
                      despesas > 0
                        ? Math.min(
                            (c.valor / despesas) * 100,
                            100
                          )
                        : 0;

                    return (
                      <li
                        key={c.nome}
                        className="dash__cat"
                      >
                        <span
                          className="dash__dot"
                          style={{ background: cor }}
                          aria-hidden="true"
                        />

                        <span className="dash__cat-name">
                          {c.nome}
                        </span>

                        <span
                          className="dash__cat-track"
                          aria-hidden="true"
                        >
                          <span
                            className="dash__cat-fill"
                            style={{
                              width: `${Math.max(percentual, 3)}%`,
                              background: cor,
                            }}
                          />
                        </span>

                        <span className="dash__cat-value">
                          {moeda(c.valor)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Transacoes recentes */}
              <section className="dash__recent">
                <div className="dash__recent-head">
                  <h2>Recentes</h2>

                  <button
                    type="button"
                    className="dash__link"
                    onClick={() => navigate('/transacoes')}
                  >
                    Ver tudo
                  </button>
                </div>

                {recentes.length === 0 && (
                  <p>Nenhuma transação cadastrada.</p>
                )}

                <ul className="dash__txs">
                  {recentes.map((t) => {
                    const categoria = obterCategoria(
                      t.categoria
                    );

                    const valorAssinado =
                      t.tipo === 'receita'
                        ? t.valor
                        : -t.valor;

                    return (
                      <li
                        key={t.id}
                        className="dash__tx"
                        onClick={() =>
                          navigate(`/transacoes/${t.id}`)
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        <span
                          className="dash__tile"
                          style={{
                            ['--c' as string]: categoria.cor,
                          }}
                          aria-hidden="true"
                        >
                          {categoria.sigla}
                        </span>

                        <div className="dash__tx-info">
                          <p className="dash__tx-title">
                            {t.descricao}
                          </p>

                          <p className="dash__tx-sub">
                            {t.categoria} · {formatarData(t.data)}
                          </p>
                        </div>

                        <span
                          className={`dash__tx-value ${
                            t.tipo === 'despesa'
                              ? 'dash__tx-value--out'
                              : 'dash__tx-value--in'
                          }`}
                        >
                          {movimento(valorAssinado)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </main>
      </IonContent>

      <IonFooter className="ion-no-border dash-footer">
        <BarraNavegacao abaAtiva="dashboard" />
      </IonFooter>
    </IonPage>
  );
};

export default Dashboard;
