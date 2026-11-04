import React from "react";

import { IconeSol, IconeLua } from "./Icones";

export type Tema = "claro" | "escuro";

type SeletorTemaProps = {
  tema: Tema;
  onMudar: (tema: Tema) => void;
};

const OPCOES = [
  { id: "claro" as Tema, rotulo: "Claro", Icone: IconeSol },
  { id: "escuro" as Tema, rotulo: "Escuro", Icone: IconeLua },
];

const SeletorTema: React.FC<SeletorTemaProps> = ({ tema, onMudar }) => (
  <section className="config-card" aria-labelledby="titulo-tema">
    <h2 id="titulo-tema" className="config-card__titulo">
      Opção de tema
    </h2>

    <div className="tema-opcoes" role="group" aria-label="Escolher tema">
      {OPCOES.map(({ id, rotulo, Icone }) => {
        const ativo = tema === id;
        return (
          <button
            key={id}
            type="button"
            className={`tema-botao ${ativo ? "tema-botao--ativo" : ""}`}
            aria-pressed={ativo}
            onClick={() => onMudar(id)}
          >
            <Icone tamanho={24} />
            <span className="tema-botao__rotulo">{rotulo}</span>
            {ativo && <span className="tema-botao__status">Ativo</span>}
          </button>
        );
      })}
    </div>
  </section>
);

export default SeletorTema;