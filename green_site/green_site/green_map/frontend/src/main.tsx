import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode rimosso: causa double-mount che spezza il loop Three.js in dev
createRoot(document.getElementById('root')!).render(<App />)
