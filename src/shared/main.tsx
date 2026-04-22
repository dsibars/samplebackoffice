import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './presentation/App';
import './presentation/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
