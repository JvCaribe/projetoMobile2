import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import BarraNavegacao from "../components/BarraNavegacao";
import "./Transacoes.css";

type Tipo = "receita" | "despesa";
type Filtro = "todas" | "receitas" | "despesas";

type Categoria =
  | "Moradia"
  | "Alimentação"
  | "Transporte"
  | "Saúde"
  | "Educação"
  | "Assinaturas"
  | "Lazer"
  | "Outros"
  | "Freelance";

type Transacao = {
  id: number;
  descricao: string;
  categoria: Categoria;
  valor: number;
  tipo: Tipo;
  data: string; // AAAA-MM-DD
};

const CATEGORIAS: Record<Categoria, { sigla: string; cor: string }> = {
  Moradia: { sigla: "MO", cor: "#E74797" },
  Alimentação: { sigla: "AL", cor: "#D76619" },
  Transporte: { sigla: "TR", cor: "#5F6E85" },
  Saúde: { sigla: "SA", cor: "#14A99A" },
  Educação: { sigla: "ED", cor: "#6366F1" },
  Assinaturas: { sigla: "AS", cor: "#A554F2" },
  Lazer: { sigla: "LA", cor: "#E93D5B" },
  Outros: { sigla: "OU", cor: "#94A3B8" },
  Freelance: { sigla: "FR", cor: "#7C6CF2" },
};

const TRANSACOES: Transacao[] = [
  { id: 1, descricao: "Cinema com amigos", categoria: "Lazer", valor: 78, tipo: "despesa", data: "2026-09-21" },
  { id: 2, descricao: "Consulta médica", categoria: "Saúde", valor: 155.8, tipo: "despesa", data: "2026-09-20" },
  { id: 3, descricao: "Venda notebook antigo", categoria: "Outros", valor: 200, tipo: "receita", data: "2026-09-19" },
  { id: 4, descricao: "Mensalidade faculdade", categoria: "Educação", valor: 540, tipo: "despesa", data: "2026-09-18" },
  { id: 5, descricao: "Combustível e Uber", categoria: "Transporte", valor: 210, tipo: "despesa", data: "2026-09-15" },
  { id: 6, descricao: "Serviços streaming", categoria: "Assinaturas", valor: 89.9, tipo: "despesa", data: "2026-09-12" },
  { id: 7, descricao: "Projeto UI design", categoria: "Freelance", valor: 650, tipo: "receita", data: "2026-09-10" },
  { id: 8, descricao: "Aluguel", categoria: "Moradia", valor: 1200, tipo: "despesa", data: "2026-09-05" },
];

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

  const grupos = useMemo(() => {
    const termo = normalizar(busca.trim());

    const filtradas = TRANSACOES.filter((t) => {
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
  }, [busca, filtro]);

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