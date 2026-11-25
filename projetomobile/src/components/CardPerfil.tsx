import React from "react";

type CardPerfilProps = {
  nome: string;
  email: string;
  /** Quando informado, mostra o botão "Sair da conta" no card. */
  onSair?: () => void;
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

const CardPerfil: React.FC<CardPerfilProps> = ({ nome, email, onSair }) => (
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

    {onSair && (
      <button type="button" className="perfil__sair" onClick={onSair}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Sair da conta
      </button>
    )}
  </section>
);

export default CardPerfil;