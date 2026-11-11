import React, { useEffect, useState } from "react";

import BarraNavegacao from "../components/BarraNavegacao";
import CardPerfil from "../components/CardPerfil";
import CardSobre from "../components/CardSobre";
import SeletorTema from "../components/SeletorTema";
import { aplicarTema, lerTemaSalvo } from "../theme/tema";
import type { Tema } from "../theme/tema";

import "./Configuracoes.css";

const USUARIO = {
  nome: "Ana Souza",
  email: "ana.souza@email.com",
};

const INFO_APP = [
  { rotulo: "Versão", valor: "1.0.0" },
  { rotulo: "Desenvolvido por", valor: "Projeto Faculdade" },
  { rotulo: "Ano", valor: "2026" },
];

const Configuracoes: React.FC = () => {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  return (
    <div className="config-pagina">
      <div className="config-tela">
        <main className="config-conteudo">
          <h1 className="config-titulo">Configurações</h1>
          <SeletorTema tema={tema} onMudar={setTema} />
          <CardPerfil nome={USUARIO.nome} email={USUARIO.email} />
          <CardSobre informacoes={INFO_APP} />
        </main>

        <BarraNavegacao abaAtiva="configuracoes" />
      </div>
    </div>
  );
};

export default Configuracoes;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Configuracoes.css";

// type Tema = "claro" | "escuro";

// const CHAVE_TEMA = "finanza-tema";

// /* ------------------------------------------------------------------ */
// /* Tema (compartilhado entre telas via atributo data-tema no <html>)   */
// /* ------------------------------------------------------------------ */
// function lerTemaSalvo(): Tema {
//   try {
//     const salvo = localStorage.getItem(CHAVE_TEMA);
//     if (salvo === "claro" || salvo === "escuro") return salvo;
//   } catch {
//     /* localStorage indisponível: usa o padrão */
//   }
//   return "escuro";
// }

// function aplicarTema(tema: Tema) {
//   document.documentElement.setAttribute("data-tema", tema);
//   try {
//     localStorage.setItem(CHAVE_TEMA, tema);
//   } catch {
//     /* ignora */
//   }
// }

// /* ------------------------------------------------------------------ */
// /* Ícones (lineares e minimalistas, conforme o guia de estilo)         */
// /* ------------------------------------------------------------------ */
// type IconeProps = { tamanho?: number };

// const propsSvg = (tamanho: number) => ({
//   width: tamanho,
//   height: tamanho,
//   viewBox: "0 0 24 24",
//   fill: "none",
//   stroke: "currentColor",
//   strokeWidth: 1.8,
//   strokeLinecap: "round" as const,
//   strokeLinejoin: "round" as const,
//   "aria-hidden": true,
//   focusable: false,
// });

// const IconeSol = ({ tamanho = 24 }: IconeProps) => (
//   <svg {...propsSvg(tamanho)}>
//     <circle cx="12" cy="12" r="4" />
//     <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
//   </svg>
// );

// const IconeLua = ({ tamanho = 24 }: IconeProps) => (
//   <svg {...propsSvg(tamanho)}>
//     <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
//   </svg>
// );

// const IconeCasa = ({ tamanho = 24 }: IconeProps) => (
//   <svg {...propsSvg(tamanho)}>
//     <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
//   </svg>
// );

// const IconeLista = ({ tamanho = 24 }: IconeProps) => (
//   <svg {...propsSvg(tamanho)}>
//     <path d="M8 6h13M8 12h13M8 18h13" />
//     <circle cx="3.5" cy="6" r="0.6" />
//     <circle cx="3.5" cy="12" r="0.6" />
//     <circle cx="3.5" cy="18" r="0.6" />
//   </svg>
// );

// const IconeEngrenagem = ({ tamanho = 24 }: IconeProps) => (
//   <svg {...propsSvg(tamanho)}>
//     <circle cx="12" cy="12" r="3" />
//     <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
//   </svg>
// );

// /* ------------------------------------------------------------------ */
// /* Dados                                                               */
// /* ------------------------------------------------------------------ */
// const USUARIO = {
//   nome: "Ana Souza",
//   email: "ana.souza@email.com",
// };

// const INFO_APP = [
//   { rotulo: "Versão", valor: "1.0.0" },
//   { rotulo: "Desenvolvido por", valor: "Projeto Faculdade" },
//   { rotulo: "Ano", valor: "2026" },
// ];

// function iniciais(nome: string) {
//   const partes = nome.trim().split(/\s+/);
//   const primeira = partes[0]?.[0] ?? "";
//   const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
//   return (primeira + ultima).toUpperCase();
// }

// /* ------------------------------------------------------------------ */
// /* Componente                                                          */
// /* ------------------------------------------------------------------ */
// // export default function Configuracoes(): React.JSX.Element  {
  
// const Configuracoes: React.FC = () => {
// const navigate = useNavigate();
//   const [tema, setTema] = useState<Tema>(lerTemaSalvo);

//   useEffect(() => {
//     aplicarTema(tema);
//   }, [tema]);

//   const opcoesTema = [
//     { id: "claro" as Tema, rotulo: "Claro", Icone: IconeSol },
//     { id: "escuro" as Tema, rotulo: "Escuro", Icone: IconeLua },
//   ];

//   const abasNavegacao = [
//     { rotulo: "Dashboard", rota: "/dashboard", Icone: IconeCasa, ativa: false },
//     { rotulo: "Transações", rota: "/transacoes", Icone: IconeLista, ativa: false },
//     { rotulo: "Config.", rota: "/configuracoes", Icone: IconeEngrenagem, ativa: true },
//   ];

//   return (
//     <div className="config-pagina">
//       <div className="config-tela">
//         <main className="config-conteudo">
//           <h1 className="config-titulo">Configurações</h1>

//           {/* Tema */}
//           <section className="config-card" aria-labelledby="titulo-tema">
//             <h2 id="titulo-tema" className="config-card__titulo">
//               Opção de tema
//             </h2>

//             <div className="tema-opcoes" role="group" aria-label="Escolher tema">
//               {opcoesTema.map(({ id, rotulo, Icone }) => {
//                 const ativo = tema === id;
//                 return (
//                   <button
//                     key={id}
//                     type="button"
//                     className={`tema-botao ${ativo ? "tema-botao--ativo" : ""}`}
//                     aria-pressed={ativo}
//                     onClick={() => setTema(id)}
//                   >
//                     <Icone tamanho={24} />
//                     <span className="tema-botao__rotulo">{rotulo}</span>
//                     {ativo && <span className="tema-botao__status">Ativo</span>}
//                   </button>
//                 );
//               })}
//             </div>
//           </section>

//           {/* Perfil */}
//           <section className="config-card" aria-labelledby="titulo-perfil">
//             <h2 id="titulo-perfil" className="config-card__titulo">
//               Perfil
//             </h2>

//             <div className="perfil">
//               <div className="perfil__avatar" aria-hidden="true">
//                 {iniciais(USUARIO.nome)}
//               </div>
//               <div className="perfil__dados">
//                 <p className="perfil__nome">{USUARIO.nome}</p>
//                 <p className="perfil__email">{USUARIO.email}</p>
//               </div>
//             </div>
//           </section>

//           {/* Sobre o app */}
//           <section className="config-card" aria-labelledby="titulo-sobre">
//             <h2 id="titulo-sobre" className="config-card__titulo">
//               Sobre o app
//             </h2>

//             <dl className="sobre">
//               {INFO_APP.map(({ rotulo, valor }) => (
//                 <div className="sobre__linha" key={rotulo}>
//                   <dt className="sobre__rotulo">{rotulo}</dt>
//                   <dd className="sobre__valor">{valor}</dd>
//                 </div>
//               ))}
//             </dl>
//           </section>
//         </main>

//         {/* Barra de navegação inferior */}
//         <nav className="config-nav" aria-label="Navegação principal">
//           {abasNavegacao.map(({ rotulo, rota, Icone, ativa }) => (
//             <button
//               key={rota}
//               type="button"
//               className={`nav-item ${ativa ? "nav-item--ativo" : ""}`}
//               aria-current={ativa ? "page" : undefined}
//               onClick={() => !ativa && navigate(rota)}
//             >
//               <Icone tamanho={22} />
//               <span>{rotulo}</span>
//             </button>
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// }