import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './styles/global.css'
import App from './App.tsx'
import { initializeSecurity, disableConsole } from './utils/security'

// セキュリティ機能を初期化
initializeSecurity()

// 本番環境ではコンソール出力を無効化
disableConsole()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
