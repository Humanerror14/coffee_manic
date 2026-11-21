import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './authContext.jsx'
import Navbar from './components/Navbar.jsx'
import RouteTransition from './components/RouteTransition.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import ShopDetail from './pages/ShopDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Admin from './pages/Admin.jsx'

function AppRoutes() {
  return (
    <RouteTransition>
      {(renderedLocation) => (
        <Routes location={renderedLocation}>
          <Route path="/" element={<Home />} />
          <Route path="/jelajahi" element={<Explore />} />
          <Route path="/kedai/:slug" element={<ShopDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      )}
    </RouteTransition>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-outer-shell">
          <a href="#main-content" className="skip-to-main">
            Langsung ke konten utama
          </a>
          <div className="app-canvas">
            <Navbar />
            <main id="main-content" className="app-main-content" tabIndex="-1">
              <AppRoutes />
            </main>
            <footer className="footer">
              <div className="footer-content">
                <span className="footer-brand">Coffee Manic</span>
                <span className="footer-sep">·</span>
                <span>Lhoksukon, Aceh Utara</span>
              </div>
            </footer>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
