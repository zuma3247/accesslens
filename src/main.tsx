import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import './styles/globals.css';
import './styles/emulation.css';

async function mountApp() {
  const root = document.getElementById('root')!;
  const app = <App />;

  if (import.meta.env.DEV) {
    const axeReact = await import('@axe-core/react');
    await axeReact.default(React, ReactDOM, 1000);
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>{app}</ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

mountApp();
