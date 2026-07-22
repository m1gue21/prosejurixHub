import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ClienteLogin from './pages/cliente/Login';
import ClienteTramites from './pages/cliente/Tramites';
import TramiteDetalleCliente from './pages/cliente/TramiteDetalle';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Usuarios from './pages/admin/Usuarios';
import UsuarioDetalle from './pages/admin/UsuarioDetalle';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/usuarios/:id" element={<UsuarioDetalle />} />
          <Route path="/admin/procesos" element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="/admin/procesos/:id" element={<Navigate to="/admin/usuarios" replace />} />

          <Route path="/portal" element={<ClienteLogin />} />
          <Route path="/portal/tramites" element={<ClienteTramites />} />
          <Route path="/portal/tramites/:id" element={<TramiteDetalleCliente />} />
          <Route path="/portal/proceso" element={<Navigate to="/portal/tramites" replace />} />
          <Route path="/portal/proceso/:id" element={<Navigate to="/portal" replace />} />

          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sobre-nosotros" element={<About />} />
                    <Route path="/servicios" element={<Services />} />
                    <Route path="/servicios/:serviceId" element={<ServiceDetail />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/contacto" element={<Contact />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
