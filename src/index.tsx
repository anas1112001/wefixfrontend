import { appText } from 'data/appText'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import 'styles/index.css'
import 'styles/fonts.css'
import { LoginPage } from 'pages/LoginPage/LoginPage'
import Dashboard from 'pages/Dashboard/Dashboard'
import Companies from 'pages/Companies/Companies'
import Individuals from 'pages/Individuals/Individuals'
import Contracts from 'pages/Contracts/Contracts'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/" />
        <Route element={<LoginPage />} path={appText.links[1]} />
        <Route element={<Dashboard />} path={appText.links[2]} />
        <Route element={<Companies />} path={appText.links[5]} />
        <Route element={<Individuals />} path={appText.links[6]} />
        <Route element={<Contracts />} path={appText.links[7]} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
