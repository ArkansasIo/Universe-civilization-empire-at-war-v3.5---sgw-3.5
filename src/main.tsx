import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// GitHub Pages can briefly serve cached HTML that references a chunk from an
// older deployment. Reload once when Vite reports a failed dynamic import so
// the browser obtains the current asset manifest instead of showing a blank page.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloadKey = 'uc_vite_reload_at';
  const now = Date.now();
  const previousReload = Number(sessionStorage.getItem(reloadKey) || '0');

  if (now - previousReload > 10_000) {
    sessionStorage.setItem(reloadKey, String(now));
    window.location.reload();
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Universe Civilization boot failure: #root element is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
