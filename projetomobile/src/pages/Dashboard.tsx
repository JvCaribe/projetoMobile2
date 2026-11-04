import { useState } from 'react';
import { IonContent, IonFooter, IonIcon, IonPage } from '@ionic/react';
import { arrowDownOutline, arrowUpOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import './Dashboard.css';

/* ===== Dados de exemplo (trocar pela API depois) ===== */
const USUARIO = 'Ana Souza';
const PERIODO = 'Setembro 2026';
const RECEITAS = 5650;

const CATEGORIAS = [
  { nome: 'Moradia', valor: 1200, cor: '#E74797' },
  { nome: 'Alimentação', valor: 320.5, cor: '#D76619' },
  { nome: 'Transporte', valor: 210, cor: '#5F6E85' },
  { nome: 'Saúde', valor: 155.8, cor: '#14A99A' },
  { nome: 'Educação', valor: 540, cor: '#6366F1' },
  { nome: 'Assinaturas', valor: 89.9, cor: '#A554F2' },
  { nome: 'Lazer', valor: 78, cor: '#E93D5B' },
];

const RECENTES = [
  { id: 1, titulo: 'Cinema com amigos', categoria: 'Lazer', sigla: 'LA', data: '21 de set.', valor: -78, cor: '#E93D5B' },
  { id: 2, titulo: 'Consulta médica', categoria: 'Saúde', sigla: 'SA', data: '20 de set.', valor: -155.8, cor: '#14A99A' },
  { id: 3, titulo: 'Venda notebook antigo', categoria: 'Outros', sigla: 'OU', data: '19 de set.', valor: 200, cor: '#94A3B8' },
];

/* ===== Formatação ===== */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moeda = (v: number) => brl.format(v);
const movimento = (v: number) => `${v < 0 ? '-' : '+'}${brl.format(Math.abs(v))}`;

const Dashboard: React.FC = () => {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  const despesas = CATEGORIAS.reduce((soma, c) => soma + c.valor, 0);
  const saldo = RECEITAS - despesas;
  const maior = Math.max(RECEITAS, despesas);

  const primeiroNome = USUARIO.split(' ')[0];
  const iniciais = USUARIO.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <IonPage>
      <IonContent fullscreen className="dash-content">
        <main className="dash">
          {/* Cabeçalho */}
          <header className="dash__header">
            <div>
              <p className="dash__hello">OLÁ, {primeiroNome.toUpperCase()}</p>
              <h1>Dashboard Financeiro</h1>
            </div>
            <div className="dash__avatar" aria-label={`Usuária ${USUARIO}`}>
              {iniciais}
            </div>
          </header>

          {/* Saldo total */}
          <section className="dash__balance" aria-label="Saldo total">
            <p className="dash__balance-label">SALDO TOTAL</p>
            <button
              type="button"
              className="dash__eye"
              aria-label={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
              onClick={() => setMostrarSaldo((v) => !v)}
            >
              <IonIcon icon={mostrarSaldo ? eyeOutline : eyeOffOutline} />
            </button>
            <p className="dash__balance-value">{mostrarSaldo ? moeda(saldo) : 'R$ ••••••'}</p>
            <p className="dash__balance-period">{PERIODO}</p>
          </section>

          {/* Receitas vs despesas */}
          <section className="dash__card">
            <h2 className="dash__card-title">RECEITAS VS DESPESAS</h2>

            <div className="dash__flow">
              <div className="dash__flow-head">
                <span className="dash__flow-name dash__flow-name--in">Receitas</span>
                <span className="dash__mono dash__mono--in">{moeda(RECEITAS)}</span>
              </div>
              <div className="dash__track" aria-hidden="true">
                <div
                  className="dash__fill dash__fill--in"
                  style={{ width: `${(RECEITAS / maior) * 100}%` }}
                />
              </div>
            </div>

            <div className="dash__flow">
              <div className="dash__flow-head">
                <span className="dash__flow-name dash__flow-name--out">Despesas</span>
                <span className="dash__mono dash__mono--out">{moeda(despesas)}</span>
              </div>
              <div className="dash__track" aria-hidden="true">
                <div
                  className="dash__fill dash__fill--out"
                  style={{ width: `${(despesas / maior) * 100}%` }}
                />
              </div>
            </div>

            <div className="dash__actions">
              <button
                type="button"
                className="dash__action dash__action--in"
                onClick={() => console.log('TODO: abrir receitas')}
              >
                <IonIcon icon={arrowUpOutline} />
                Ver Receitas
              </button>
              <button
                type="button"
                className="dash__action dash__action--out"
                onClick={() => console.log('TODO: abrir despesas')}
              >
                <IonIcon icon={arrowDownOutline} />
                Ver Despesas
              </button>
            </div>
          </section>

          {/* Despesas por categoria */}
          <section className="dash__card">
            <h2 className="dash__card-title">DESPESAS POR CATEGORIA</h2>
            <ul className="dash__cats">
              {CATEGORIAS.map((c) => (
                <li key={c.nome} className="dash__cat">
                  <span className="dash__dot" style={{ background: c.cor }} aria-hidden="true" />
                  <span className="dash__cat-name">{c.nome}</span>
                  <span className="dash__cat-track" aria-hidden="true">
                    <span
                      className="dash__cat-fill"
                      style={{
                        width: `${Math.max((c.valor / despesas) * 100, 3)}%`,
                        background: c.cor,
                      }}
                    />
                  </span>
                  <span className="dash__cat-value">{moeda(c.valor)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recentes */}
          <section className="dash__recent">
            <div className="dash__recent-head">
              <h2>Recentes</h2>
              <button
                type="button"
                className="dash__link"
                onClick={() => console.log('TODO: abrir transações')}
              >
                Ver tudo
              </button>
            </div>

            <ul className="dash__txs">
              {RECENTES.map((t) => (
                <li key={t.id} className="dash__tx">
                  <span
                    className="dash__tile"
                    style={{ ['--c' as string]: t.cor }}
                    aria-hidden="true"
                  >
                    {t.sigla}
                  </span>
                  <div className="dash__tx-info">
                    <p className="dash__tx-title">{t.titulo}</p>
                    <p className="dash__tx-sub">
                      {t.categoria} · {t.data}
                    </p>
                  </div>
                  <span
                    className={`dash__tx-value ${t.valor < 0 ? 'dash__tx-value--out' : 'dash__tx-value--in'}`}
                  >
                    {movimento(t.valor)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;