import App from 'App'
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
        <Route element={<App />} path={appText.links[0]} />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<LoginPage />} path={appText.links[1]} />
        <Route element={<Dashboard />} path="/dashboard" />
        <Route element={<Dashboard />} path={appText.links[2]} />
        <Route element={<Companies />} path="/customers/companies" />
        <Route element={<Individuals />} path="/customers/individuals" />
        <Route element={<Contracts />} path="/contracts" />
        <Route element={<Dashboard />} path="/" />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
