// @pca:start
// @id(admin_pwa.main)
// @kind(component)
// @limit(lines: 200)
// @relates(admin_pwa.app)
// @relates(admin_pwa.styles.admin)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (main.tsx))
// @pca:end
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/admin.css";

// Registro Service Worker PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Admin PWA Service Worker registrado:", reg.scope))
      .catch((err) => console.warn("Error registrando SW:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
