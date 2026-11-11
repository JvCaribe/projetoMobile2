import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';

import Cadastro from './pages/Cadastro';
import Configuracoes from "./pages/Configuracoes";
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Transacoes from "./pages/Transacoes";
import DetalhesTransacoes from './pages/DetalhesTransacoes';
import NovaTransacao from './pages/NovaTransacao';



/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/transacoes" element={<Transacoes />} /> 
        <Route path="/transacoes/nova" element={<NovaTransacao />} />
        <Route path="/transacoes/:id" element={<DetalhesTransacoes />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="/dashboard" element={<Dashboard />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
