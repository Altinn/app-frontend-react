import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../apps/app-frontend/src/App';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  const root = container && createRoot(container);
  root?.render(<App />);
});