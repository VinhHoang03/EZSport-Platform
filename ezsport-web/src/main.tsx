import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import router from './app/router';
import { AuthProvider } from './context/AuthContext';

// Google Maps SDK is loaded via index.html (with language=vi&region=VN)
// Do NOT load it again here to prevent duplicate custom element registration errors.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
