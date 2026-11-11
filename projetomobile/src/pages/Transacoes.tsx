import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import BarraNavegacao from "../components/BarraNavegacao";
import { CATEGORIAS, useTransacoes } from "../data/transacoes";
import type { Tipo, Transacao } from "../data/transacoes";
import "./Transacoes.css";

type Filtro = "todas" | "receitas" | "despesas";

const formatarValor = (valor: number, tipo: Tipo): string => {
  const numero = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${tipo === "receita" ? "+" : "-"}R$ ${numero}`;
};

const formatarDia = (iso: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });

const formatarMes = (iso: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

const normalizar = (texto: string): string =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "receitas", rotulo: "Receitas" },
  { id: "despesas", rotulo: "Despesas" },
];

const Transacoes: React.FC = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const transacoes = useTransacoes();

  const grupos = useMemo(() => {
    const termo = normalizar(busca.trim());

    const filtradas = transacoes.filter((t) => {
      if (filtro === "receitas" && t.tipo !== "receita") return false;
      if (filtro === "despesas" && t.tipo !== "despesa") return false;
      if (!termo) return true;
      return (
        normalizar(t.descricao).includes(termo) ||
        normalizar(t.categoria).includes(termo)
      );
    }).sort((a, b) => b.data.localeCompare(a.data));

    const porMes = new Map<string, Transacao[]>();
    filtradas.forEach((t) => {
      const chave = t.data.slice(0, 7);
      porMes.set(chave, [...(porMes.get(chave) ?? []), t]);
    });

    return Array.from(porMes.values());
  }, [busca, filtro, transacoes]);

  return (
    <div className="tela-transacoes">
      <main className="transacoes">
        <header className="transacoes__cabecalho">
          <h1 className="transacoes__titulo">Histórico / Extrato</h1>
          <button
            type="button"
            className="botao-adicionar"
            aria-label="Adicionar transação"
            onClick={() => navigate("/transacoes/nova")}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </header>

        <input
          type="search"
          className="campo-busca"
          placeholder="Buscar transação..."
          aria-label="Buscar transação"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="filtros" role="group" aria-label="Filtrar por tipo">
          {FILTROS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              className={`filtro ${filtro === id ? "filtro--ativo" : ""}`}
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {grupos.length === 0 && (
          <p className="transacoes__vazio">
            Nenhuma transação encontrada. Tente outra busca ou filtro.
          </p>
        )}

        {grupos.map((itens) => (
          <section key={itens[0].data.slice(0, 7)} className="mes">
            <h2 className="mes__titulo">{formatarMes(itens[0].data)}</h2>

            <ul className="lista">
              {itens.map((t) => {
                const { sigla, cor } = CATEGORIAS[t.categoria];
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="card-transacao"
                      onClick={() => navigate(`/transacoes/${t.id}`)}
                      aria-label={`${t.descricao}, ${t.tipo}, ${formatarValor(
                        t.valor,
                        t.tipo
                      )}, ${t.categoria}, ${formatarDia(t.data)}`}
                    >
                      <span
                        className="card-transacao__icone"
                        style={{ color: cor, backgroundColor: `${cor}2E` }}
                        aria-hidden="true"
                      >
                        {sigla}
                      </span>

                      <span className="card-transacao__texto">
                        <span className="card-transacao__nome">{t.descricao}</span>
                        <span className="card-transacao__meta">
                          {t.categoria} · {formatarDia(t.data)}
                        </span>
                      </span>

                      <span
                        className={`card-transacao__valor card-transacao__valor--${t.tipo}`}
                      >
                        {formatarValor(t.valor, t.tipo)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      <BarraNavegacao abaAtiva="transacoes" />
    </div>
  );
};

export default Transacoes;