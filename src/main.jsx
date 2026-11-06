import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </StoreProvider>
)
