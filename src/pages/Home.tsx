import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Award, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import LandingLayout from '../components/common/LandingLayout';

const Home = () => {
  const services = [
    {
      id: 'accidentes-transito',
      title: 'Accidentes de Tránsito',
      description: 'Representación legal especializada en casos de accidentes vehiculares y reclamación de indemnizaciones.',
      icon: '🚗'
    },
    {
      id: 'negligencia-medica',
      title: 'Negligencia Médica',
      description: 'Defensa de víctimas de mala praxis médica y errores en atención sanitaria.',
      icon: '⚕️'
    },
    {
      id: 'danos-propiedad',
      title: 'Daños a la Propiedad',
      description: 'Recuperación de daños materiales y patrimoniales por responsabilidad de terceros.',
      icon: '🏠'
    },
    {
      id: 'responsabilidad-contractual',
      title: 'Responsabilidad Contractual',
      description: 'Asesoría en incumplimientos contractuales y reclamación de perjuicios.',
      icon: '📋'
    }
  ];

  const whyChooseUs = [
    {
      title: 'Asesoría Personalizada',
      description: 'Cada caso recibe atención individual y estrategias adaptadas a sus necesidades específicas.',
      icon: <Users className="h-8 w-8 text-blue-300" />
    },
    {
      title: 'Comunicación Transparente',
      description: 'Mantenemos informados a nuestros clientes en cada etapa del proceso legal.',
      icon: <MessageCircle className="h-8 w-8 text-blue-300" />
    },
    {
      title: 'Equipo Experto',
      description: 'Abogados especializados con amplia experiencia en responsabilidad civil.',
      icon: <Award className="h-8 w-8 text-blue-300" />
    },
    {
      title: 'Enfoque en Resultados',
      description: 'Trabajamos incansablemente para obtener la mejor compensación para nuestros clientes.',
      icon: <Shield className="h-8 w-8 text-blue-300" />
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      text: 'Excelente atención y profesionalismo. Lograron una compensación justa por mi accidente.',
      case: 'Accidente de Tránsito'
    },
    {
      name: 'Carlos Rodríguez',
      text: 'El equipo de Prosejurix me acompañó durante todo el proceso con transparencia total.',
      case: 'Negligencia Médica'
    },
    {
      name: 'Ana Martínez',
      text: 'Profesionales comprometidos que realmente se preocupan por sus clientes.',
      case: 'Daños a la Propiedad'
    }
  ];

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 py-24 sm:px-6 lg:flex-row lg:items-center lg:gap-24 lg:px-8 lg:py-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200 shadow-[0_0_45px_rgba(14,116,144,0.25)] backdrop-blur">
              <Shield className="h-4 w-4 text-blue-300" />
              Defensa legal especializada en Caldas
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Prosejurix: Tu Defensa Legal Experta en
              <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                Responsabilidad Civil en Manizales
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-blue-100 sm:text-xl">
              Protegemos tus derechos con un equipo multidisciplinario, procesos transparentes y estrategias legales diseñadas para maximizar tu compensación.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/web/contacto"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-yellow-400/30 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-yellow-300/40"
              >
                Agenda tu Consulta Gratuita
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-400/40 bg-green-500/10 px-8 py-4 text-base font-semibold text-green-200 backdrop-blur transition-all duration-200 hover:border-green-400/60 hover:bg-green-400/20 hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
                Contáctanos por WhatsApp
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              {[
                { label: 'Casos defendidos', value: '500+' },
                { label: 'Años de experiencia', value: '14' },
                { label: 'Índice de satisfacción', value: '98%' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-blue-100 shadow-inner shadow-black/10 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-wide text-blue-200/80">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden w-full max-w-xl lg:block">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/30 to-indigo-500/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-blue-900/40 backdrop-blur">
              <div className="rounded-2xl bg-slate-950/80 p-10">
                <img
                  src="/prosejurix-rounded.png"
                  alt="Prosejurix Logo"
                  className="mx-auto w-60 drop-shadow-[0_30px_60px_rgba(14,165,233,0.35)]"
                />
                <p className="mt-8 text-center text-sm text-blue-200/80">
                  Tecnología, transparencia y acompañamiento legal integral en cada etapa del proceso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 via-white/0 to-white/0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              Especialidades
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Áreas Clave de Responsabilidad Civil
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-blue-100">
              Un portafolio integral de servicios diseñado para acompañarte desde la reclamación inicial hasta la resolución definitiva del proceso.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-blue-900/30 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-blue-800/40"
              >
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl transition-all duration-300 group-hover:bg-blue-400/20" />
                <div className="relative text-4xl">{service.icon}</div>
                <h3 className="relative mt-6 text-xl font-semibold text-white">
                  {service.title}
                </h3>
                <p className="relative mt-4 text-sm text-blue-100/90">
                  {service.description}
                </p>
                <Link
                  to={`/web/servicios/${service.id}`}
                  className="relative mt-8 inline-flex items-center text-sm font-semibold text-blue-200 transition-colors hover:text-white"
                >
                  Ver más detalles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/5 to-white/0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              Diferenciales
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Prosejurix: Compromiso, Experiencia y Resultados
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-blue-100">
              Construimos relaciones de confianza a través de reportes constantes, estrategias sólidas y acompañamiento humano.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center rounded-3xl border border-white/10 bg-slate-950/60 px-8 py-10 text-center shadow-2xl shadow-slate-950/40 transition hover:border-white/20 hover:bg-slate-900/60"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-blue-900/30 backdrop-blur">
                  {item.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-4 text-sm text-blue-100/90">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/5 to-white/0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              Testimonios
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              La Confianza de Nuestros Clientes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Historias reales de personas que confiaron en nosotros para recuperar su tranquilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur transition hover:border-white/20"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    {testimonial.case}
                  </div>
                  <p className="mt-6 text-base italic text-blue-100">
                    “{testimonial.text}”
                  </p>
                </div>
                <div className="mt-8 text-sm font-semibold text-white">{testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative pb-24 pt-8">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-full bg-gradient-to-b from-white/0 via-white/10 to-white/5" />
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/40 via-indigo-600/40 to-blue-600/40 px-6 py-16 text-center shadow-2xl shadow-blue-900/40 backdrop-blur sm:px-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            ¿Necesitas Asesoría Urgente?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Agenda una llamada estratégica con nuestro equipo y recibe un plan de acción claro para tu caso.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/web/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Contáctanos Ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            >
              WhatsApp Inmediato
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Home;