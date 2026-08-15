import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason ? (event.reason.message || String(event.reason)) : '';
  if (
    reason.includes('WebSocket') ||
    reason.includes('websocket') ||
    reason.includes('WebChannel') ||
    reason.includes('network error')
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes('WebSocket') || msg.includes('websocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
