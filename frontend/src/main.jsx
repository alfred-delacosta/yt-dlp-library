import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import './styles/theme.scss'
import App from './App.jsx'

try {
  registerSW({ immediate: true })
} catch {
  // Service worker registration is best-effort; the app still works without it.
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        containerStyle={{
          top: 'calc(var(--topbar-h) + var(--safe-top) + var(--space-2))',
        }}
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
