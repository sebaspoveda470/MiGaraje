import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Analytics} from '@vercel/analytics/react';
import App from './App.tsx';
import {ConfirmProvider} from './components/ConfirmDialog';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
    {/* Cookieless page-view stats; enable them in Vercel → Analytics */}
    <Analytics />
  </StrictMode>,
);
