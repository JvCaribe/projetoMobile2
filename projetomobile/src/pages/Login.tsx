import { useState } from 'react';
import { IonButton, IonContent, IonIcon, IonInput, IonPage, useIonRouter } from '@ionic/react';
import { eyeOutline, eyeOffOutline, walletOutline } from 'ionicons/icons';
import { useAviso } from '../hooks/useAviso';
import './Login.css';

const Login: React.FC = () => {
  const router = useIonRouter();
  const aviso = useAviso();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleEntrar = async () => {
  try {
    const resposta = await fetch(
      'http://localhost:3000/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      aviso.erro(dados.mensagem || 'Erro ao fazer login.');
      return;
    }

    sessionStorage.setItem('finanza_token', dados.token);

    aviso.sucesso('Login realizado com sucesso!');
    router.push('/dashboard', 'root');

  } catch (erro) {
    aviso.erro('Não foi possível conectar ao servidor.');
    console.error(erro);
  }
};

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <main className="login">
          <header className="login__brand">
            <span className="login__logo">
              <IonIcon icon={walletOutline} />
            </span>
            <span className="login__name">Finanza</span>
          </header>

          <section className="login__intro">
            <h1>
              Bem-vindo
              <br />
              de volta
            </h1>
            <p>Gerencie suas finanças com facilidade</p>
          </section>

          <form
            className="login__form"
            onSubmit={(e) => {
              e.preventDefault();
              handleEntrar();
            }}
          >
            <label className="login__label" htmlFor="email">
              E-MAIL
            </label>
            <IonInput
              id="email"
              className="login__input"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="seu@email.com"
              value={email}
              onIonInput={(e) => setEmail(String(e.detail.value ?? ''))}
            />

            <label className="login__label" htmlFor="senha">
              SENHA
            </label>
            <div className="login__password">
              <IonInput
                id="senha"
                className="login__input"
                type={mostrarSenha ? 'text' : 'password'}
                autocomplete="current-password"
                placeholder="Sua senha"
                value={senha}
                onIonInput={(e) => setSenha(String(e.detail.value ?? ''))}
              />
              <button
                type="button"
                className="login__eye"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setMostrarSenha((v) => !v)}
              >
                <IonIcon icon={mostrarSenha ? eyeOffOutline : eyeOutline} />
              </button>
            </div>

            <a className="login__forgot" href="/recuperar-senha">
              Esqueci minha senha
            </a>

            <IonButton type="submit" expand="block" className="login__submit">
              Entrar
            </IonButton>
          </form>

          <p className="login__signup">
            Não tem conta? <a href="/cadastro">Cadastre-se</a>
          </p>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Login;