import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Catch and suppress benign HMR WebSocket/Vite proxy errors in the sandbox
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason || '';
    if (
      String(reason).includes('WebSocket') || 
      String(reason).includes('vite') || 
      String(reason).includes('ws://') || 
      String(reason).includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      String(message).includes('WebSocket') || 
      String(message).includes('vite') || 
      String(message).includes('ws://') || 
      String(message).includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


