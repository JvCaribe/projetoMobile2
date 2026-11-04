import React from "react";
import { useNavigate } from "react-router-dom";

import { IconeCasa, IconeLista, IconeEngrenagem } from "./Icones";

export type Aba = "dashboard" | "transacoes" | "configuracoes";

type BarraNavegacaoProps = {
  abaAtiva: Aba;
};

const ABAS = [
  { id: "dashboard" as Aba, rotulo: "Dashboard", rota: "/dashboard", Icone: IconeCasa },
  { id: "transacoes" as Aba, rotulo: "Transações", rota: "/transacoes", Icone: IconeLista },
  { id: "configuracoes" as Aba, rotulo: "Config.", rota: "/configuracoes", Icone: IconeEngrenagem },
];

const BarraNavegacao: React.FC<BarraNavegacaoProps> = ({ abaAtiva }) => {
  const navigate = useNavigate();

  return (
    <nav className="config-nav" aria-label="Navegação principal">
      {ABAS.map(({ id, rotulo, rota, Icone }) => {
        const ativa = id === abaAtiva;
        return (
          <button
            key={id}
            type="button"
            className={`nav-item ${ativa ? "nav-item--ativo" : ""}`}
            aria-current={ativa ? "page" : undefined}
            onClick={() => !ativa && navigate(rota)}
          >
            <Icone tamanho={22} />
            <span>{rotulo}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BarraNavegacao;