import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SessionProvider } from './context/SessionContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <CartProvider>
            <App />
            <ToastContainer position="top-center" autoClose={3000} newestOnTop pauseOnFocusLoss={false} theme="colored" />
          </CartProvider>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
