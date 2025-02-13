import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from 'src/next/app/App';

import 'react-toastify/dist/ReactToastify.css';
import 'src/index.css';
import '@digdir/designsystemet-theme/brand/altinn/tokens.css';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(<App />);
});
