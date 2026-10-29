import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            if (res && "writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
              res.end(
                JSON.stringify({
                  error: "BACKEND_NOT_RUNNING",
                  mensaje:
                    "El servidor Backend Spring Boot no está respondiendo en http://localhost:8080. Por favor inicia el backend (ej. ejecutar iniciar_backend.bat o arrancar los microservicios en NetBeans/Docker).",
                  detalle: err.message,
                })
              );
            }
          });
        },
      },
    },
  },
});
