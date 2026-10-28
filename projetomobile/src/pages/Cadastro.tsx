import { useState } from 'react';
import { IonButton, IonContent, IonIcon, IonInput, IonPage, useIonRouter } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import './Cadastro.css';

const MENSAGEM_ERRO = 'Atenda todos os campos.';

const Cadastro: React.FC = () => {
  const router = useIonRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [tentou, setTentou] = useState(false);

  const formularioValido =
    nome.trim().split(/\s+/).length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    senha.length >= 8 &&
    confirmar === senha;

  const voltar = () => {
    if (router.canGoBack()) router.goBack();
    else router.push('/login', 'back');
  };

  const handleCriarConta = () => {
    setTentou(true);
    if (!formularioValido) return;
    // TODO: integrar com a API (POST /auth/register)
    console.log({ nome, email, senha });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="cadastro-content">
        <main className="cadastro">
          <header className="cadastro__header">
            <button
              type="button"
              className="cadastro__back"
              aria-label="Voltar"
              onClick={voltar}
            >
              <IonIcon icon={chevronBack} />
            </button>
            <h1>Criar conta</h1>
          </header>

          <form
            className="cadastro__form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleCriarConta();
            }}
          >
            <label className="cadastro__label" htmlFor="nome">
              NOME COMPLETO
            </label>
            <IonInput
              id="nome"
              className="cadastro__input"
              type="text"
              autocomplete="name"
              placeholder="Ana Souza"
              value={nome}
              onIonInput={(e) => setNome(String(e.detail.value ?? ''))}
            />

            <label className="cadastro__label" htmlFor="email">
              E-MAIL
            </label>
            <IonInput
              id="email"
              className="cadastro__input"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="seu@email.com"
              value={email}
              onIonInput={(e) => setEmail(String(e.detail.value ?? ''))}
            />

            <label className="cadastro__label" htmlFor="senha">
              SENHA
            </label>
            <IonInput
              id="senha"
              className="cadastro__input"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              value={senha}
              onIonInput={(e) => setSenha(String(e.detail.value ?? ''))}
            />

            <label className="cadastro__label" htmlFor="confirmar">
              CONFIRMAR SENHA
            </label>
            <IonInput
              id="confirmar"
              className="cadastro__input"
              type="password"
              autocomplete="new-password"
              placeholder="Repita a senha"
              value={confirmar}
              onIonInput={(e) => setConfirmar(String(e.detail.value ?? ''))}
            />

            {tentou && !formularioValido && (
              <p className="cadastro__error" role="alert">
                {MENSAGEM_ERRO}
              </p>
            )}

            <IonButton type="submit" expand="block" className="cadastro__submit">
              Criar Conta
            </IonButton>
          </form>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Cadastro;