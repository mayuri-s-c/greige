import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ToastHost from './components/ToastHost.jsx';
import { AuthBootstrap } from './components/ProtectedRoute.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthBootstrap>
        <App />
        <ToastHost />
      </AuthBootstrap>
    </BrowserRouter>
  </StrictMode>
);
