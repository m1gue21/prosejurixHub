import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/prosejurix-rounded.png" 
                alt="Prosejurix Logo" 
                className="h-20"
              />
              <div>
                <h3 className="text-xl font-bold">Prosejurix</h3>
                <p className="text-sm text-slate-300">Especialistas en Responsabilidad Civil</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Protegiendo tus derechos y obteniendo la compensación justa que mereces. 
              Soluciones legales confiables y transparentes en Manizales.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/web" className="text-slate-300 hover:text-white transition-colors duration-200">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/web/sobre-nosotros" className="text-slate-300 hover:text-white transition-colors duration-200">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/web/servicios" className="text-slate-300 hover:text-white transition-colors duration-200">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/web/contacto" className="text-slate-300 hover:text-white transition-colors duration-200">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/portal" className="text-slate-300 hover:text-white transition-colors duration-200">
                  Portal Clientes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Información de Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-slate-300 text-sm">(+57) 300 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-slate-300 text-sm">info@prosejurix.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                <span className="text-slate-300 text-sm">
                  Carrera 23 #58-42, Oficina 301<br />
                  Manizales, Caldas, Colombia
                </span>
              </li>
            </ul>
          </div>

          {/* Business Hours & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Horarios de Atención</h4>
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-blue-400" />
                <div className="text-slate-300 text-sm">
                  <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                  <p>Sábados: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
            
            <h5 className="font-semibold mb-3">Síguenos</h5>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/prosejurix"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 Prosejurix. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

