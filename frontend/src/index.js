// src/index.js
import './theme.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/UserContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById("root"));

// Only register service worker in production
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  serviceWorkerRegistration.register();
} else {
  // Unregister service worker in development to avoid errors
  serviceWorkerRegistration.unregister();
}

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
