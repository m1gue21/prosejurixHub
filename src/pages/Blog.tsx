import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import LandingLayout from '../components/common/LandingLayout';

const Blog = () => {
  return (
    <LandingLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
            Recursos Legales
          </span>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Artículos Legales y Noticias
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-blue-100">
            Mantente informado sobre las últimas novedades en responsabilidad civil, cambios legislativos y consejos legales útiles.
          </p>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/5 to-white/0" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-[0_35px_70px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="text-6xl">📝</div>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Contenido en Construcción</h2>
            <p className="mt-4 text-lg text-blue-100">
              Estamos preparando análisis jurídicos, guías prácticas y novedades legales para acompañarte en cada etapa de tu proceso.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { title: 'Análisis Legal', text: 'Casos relevantes y precedentes jurisprudenciales.' },
                { title: 'Guías Prácticas', text: 'Consejos útiles para víctimas de responsabilidad civil.' },
                { title: 'Novedades', text: 'Cambios legislativos y noticias del sector.' }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-blue-100 shadow-inner shadow-blue-900/30">
                  <Calendar className="mx-auto h-8 w-8 text-blue-200" />
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-200/80">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-blue-100/90">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/web/contacto"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Solicita una Consulta
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/web/servicios"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Conoce Nuestros Servicios
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-24 pt-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/12 to-white/6" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/40 via-indigo-600/40 to-blue-600/40 px-6 py-16 shadow-[0_35px_70px_rgba(15,23,42,0.45)] backdrop-blur sm:px-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Suscríbete a Nuestras Actualizaciones</h2>
            <p className="mt-4 text-lg text-blue-100">
              Sé el primero en recibir nuestros artículos legales y consejos especializados.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Suscribirme
              </button>
            </form>
            <p className="mt-3 text-xs text-blue-200/80">No spam. Solo contenido legal valioso.</p>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Blog;