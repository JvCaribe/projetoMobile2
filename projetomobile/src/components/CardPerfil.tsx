import React from "react";

type CardPerfilProps = {
  nome: string;
  email: string;
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

const CardPerfil: React.FC<CardPerfilProps> = ({ nome, email }) => (
  <section className="config-card" aria-labelledby="titulo-perfil">
    <h2 id="titulo-perfil" className="config-card__titulo">
      Perfil
    </h2>

    <div className="perfil">
      <div className="perfil__avatar" aria-hidden="true">
        {iniciais(nome)}
      </div>
      <div className="perfil__dados">
        <p className="perfil__nome">{nome}</p>
        <p className="perfil__email">{email}</p>
      </div>
    </div>
  </section>
);

export default CardPerfil;