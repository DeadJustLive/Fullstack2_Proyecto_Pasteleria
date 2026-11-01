// @pca:start
// @id(frontend.main)
// @kind(component)
// @limit(lines: 200)
// @relates(frontend.index)
// @relates(frontend.app)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (main.tsx))
// @pca:end
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import '@/mockup/mockup.css'
import App from './App.tsx'
import { CartProvider } from '@/context/CartProvider'
import { AuthProvider } from '@/context/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
