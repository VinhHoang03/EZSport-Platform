import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import router from './app/router';
import { AuthProvider } from './context/AuthContext';

// Google Maps SDK is loaded via index.html (with language=vi&region=VN)
// Do NOT load it again here to prevent duplicate custom element registration errors.

// Load Microsoft Clarity if VITE_CLARITY_ID is set
const clarityId = import.meta.env.VITE_CLARITY_ID;
if (clarityId) {
  (function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] = c[a] || function () {
      // eslint-disable-next-line prefer-rest-params
      (c[a].q = c[a].q || []).push(arguments);
    };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    if (y && y.parentNode) {
      y.parentNode.insertBefore(t, y);
    }
  })(window, document, "clarity", "script", clarityId);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
