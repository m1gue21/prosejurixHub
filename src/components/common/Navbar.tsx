import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Shield, Home, Info, Briefcase, BookOpen, Mail } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/web', icon: Home },
    { name: 'Sobre Nosotros', href: '/web/sobre-nosotros', icon: Info },
    { name: 'Servicios', href: '/web/servicios', icon: Briefcase },
    { name: 'Blog', href: '/web/blog', icon: BookOpen },
    { name: 'Contacto', href: '/web/contacto', icon: Mail },
  ];

  const isActive = (path: string) => {
    if (path === '/web') {
      return location.pathname === '/web' || location.pathname === '/web/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/web"
          className="group flex items-center space-x-4 px-3 py-2"
        >
          <img
            src="/prosejurix-rounded.png"
            alt="Prosejurix Logo"
            className="h-14 w-auto sm:h-16"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight text-white sm:text-xl">
              Prosejurix
            </span>
            <span className="hidden text-xs font-medium uppercase tracking-[0.3em] text-blue-200/80 sm:block">
              Responsabilidad Civil
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-xl transition ${
                    active
                      ? 'bg-white/10 shadow-[0_10px_30px_rgba(56,189,248,0.15)]'
                      : 'hover:bg-white/5'
                  }`}
                />
                <Icon
                  className={`relative h-4 w-4 transition-transform ${
                    active ? 'scale-110 text-blue-200' : 'text-blue-200/70 group-hover:scale-105'
                  }`}
                />
                <span className="relative">{item.name}</span>
                {active && (
                  <span className="absolute -bottom-2 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/portal"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              isActive('/portal')
                ? 'border border-white/20 bg-white/10 text-white'
                : 'border border-white/10 bg-white/5 text-blue-100 hover:border-white/20 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            Cliente
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.25)] transition hover:from-indigo-400 hover:via-indigo-400 hover:to-blue-400 hover:shadow-[0_18px_45px_rgba(59,130,246,0.35)]"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-white/20 hover:bg-white/10 lg:hidden"
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-6 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-white/5 bg-white/5 text-slate-200 hover:border-white/15 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 text-blue-200" />
                  {item.name}
                </Link>
              );
            })}

            <div className="my-4 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
                Accesos Rápidos
              </p>
              <div className="mt-3 space-y-2">
                <Link
                  to="/portal"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isActive('/portal')
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-white/5 bg-white/5 text-blue-100 hover:border-white/15 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Portal Cliente
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(79,70,229,0.35)] transition hover:from-indigo-400 hover:via-indigo-400 hover:to-blue-400"
                >
                  <Shield className="h-5 w-5" />
                  Panel Administrativo
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
