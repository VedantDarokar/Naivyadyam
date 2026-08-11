import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Suppress third-party browser extension (MetaMask / Wallet / contentscript) noise
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || event.reason?.toString() || '';
  const stack = event.reason?.stack || '';
  if (
    msg.includes('MetaMask') ||
    msg.includes('ObjectMultiplex') ||
    stack.includes('inpage.js') ||
    stack.includes('contentscript.js')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
