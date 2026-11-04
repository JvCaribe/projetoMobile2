import React from "react";

type InfoApp = { rotulo: string; valor: string };

type CardSobreProps = {
  informacoes: InfoApp[];
};

const CardSobre: React.FC<CardSobreProps> = ({ informacoes }) => (
  <section className="config-card" aria-labelledby="titulo-sobre">
    <h2 id="titulo-sobre" className="config-card__titulo">
      Sobre o app
    </h2>

    <dl className="sobre">
      {informacoes.map(({ rotulo, valor }) => (
        <div className="sobre__linha" key={rotulo}>
          <dt className="sobre__rotulo">{rotulo}</dt>
          <dd className="sobre__valor">{valor}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export default CardSobre;