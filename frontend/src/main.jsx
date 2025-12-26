import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AppStateProvider } from './context/AppStateContext.jsx'
import './styles/base.css'
import './styles/variables.css'
import './styles/layout.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>,
)

