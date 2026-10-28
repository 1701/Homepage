import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/sixtyfour';
import '@fontsource/vt323';
import './index.css';
import './styles/machine.css';
import './styles/c64.css';
import './styles/dos.css';
import './styles/scumm.css';
import './styles/win95.css';
import './styles/web97.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
