import App from 'App'
import { appText } from 'data/appText'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'


import 'styles/index.css'
import 'styles/fonts.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />} path={appText.links[0]} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
