
import React, { useEffect, useState } from "react";

import BarraNavegacao from "../components/BarraNavegacao";
import CardPerfil from "../components/CardPerfil";
import CardSobre from "../components/CardSobre";
import SeletorTema from "../components/SeletorTema";

import { aplicarTema, lerTemaSalvo } from "../theme/tema";
import type { Tema } from "../theme/tema";

import "./Configuracoes.css";

// Dados recebidos do backend de Danilo
type Usuario = {
  id: number;
  nome: string;
  email: string;
};

const INFO_APP = [
  { rotulo: "Versão", valor: "1.0.0" },
  { rotulo: "Desenvolvido por", valor: "Projeto Faculdade" },
  { rotulo: "Ano", valor: "2026" },
];

const Configuracoes: React.FC = () => {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Manter o tema claro e escuro funcionando
  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  // Buscar o perfil real no backend
  useEffect(() => {
    const controller = new AbortController();

    const carregarPerfil = async () => {
      const token = sessionStorage.getItem("finanza_token");

      if (!token) {
        setErro("Faça login para visualizar seu perfil.");
        setCarregando(false);
        return;
      }

      try {
        const resposta = await fetch(
          "http://localhost:3000/api/usuario/perfil",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
          if (resposta.status === 401) {
            throw new Error(
              "Sua sessão expirou. Faça login novamente."
            );
          }

          throw new Error(
            dados?.mensagem ||
              "Não foi possível carregar o perfil."
          );
        }

        if (
          !dados ||
          typeof dados.nome !== "string" ||
          typeof dados.email !== "string"
        ) {
          throw new Error(
            "O servidor retornou um perfil inválido."
          );
        }

        if (!controller.signal.aborted) {
          setUsuario(dados as Usuario);
          setErro("");
        }
      } catch (erro) {
        if (controller.signal.aborted) return;

        console.error("Erro ao carregar perfil:", erro);

        setErro(
          erro instanceof Error
            ? erro.message
            : "Erro ao buscar os dados do usuário."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    };

    void carregarPerfil();

    return () => controller.abort();
  }, []);

  return (
    <IonPage className="config-pagina">
      <IonContent fullscreen className="config-content">
        <main className="config-conteudo">
          <h1 className="config-titulo">
            Configurações
          </h1>

          {/* Tema claro e escuro */}
          <SeletorTema
            tema={tema}
            onMudar={setTema}
          />

          {/* Perfil do usuário logado */}
          {carregando && (
            <p role="status">
              Carregando perfil...
            </p>
          )}

          {erro && (
            <p role="alert">
              {erro}
            </p>
          )}

          {!carregando && !erro && usuario && (
            <CardPerfil
              nome={usuario.nome}
              email={usuario.email}
            />
          )}

          {/* Informações sobre o aplicativo */}
          <CardSobre informacoes={INFO_APP} />
        </main>
      </IonContent>

      <IonFooter className="ion-no-border">
        <BarraNavegacao abaAtiva="configuracoes" />
      </IonFooter>
    </IonPage>
  );
};

export default Configuracoes;
