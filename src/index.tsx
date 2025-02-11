import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from 'src/next/App';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(<App />);
});
