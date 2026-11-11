import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { aplicarTema, lerTemaSalvo } from './theme/tema';

// Aplica o tema salvo antes de renderizar, para valer em todas as telas (sem "piscar")
aplicarTema(lerTemaSalvo());

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
