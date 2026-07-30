import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, FileText, Users, Clock } from 'lucide-react';
import LandingLayout from '../components/common/LandingLayout';

const Services = () => {
  const services = [
    {
      id: 'accidentes-transito',
      title: 'Responsabilidad Civil por Accidentes de Tránsito',
      description: 'Representación legal especializada en accidentes vehiculares, incluyendo colisiones, atropellos y daños materiales. Recuperamos compensaciones por lesiones personales, daños a vehículos, lucro cesante y daño emergente.',
      features: ['Evaluación gratuita del caso', 'Gestión con aseguradoras', 'Peritajes técnicos', 'Representación judicial'],
      icon: '🚗'
    },
    {
      id: 'negligencia-medica',
      title: 'Responsabilidad Médica',
      description: 'Defensa especializada en casos de mala praxis médica, errores de diagnóstico, negligencia hospitalaria y daños por tratamientos inadecuados. Protegemos los derechos de pacientes y familias.',
      features: ['Análisis de historias clínicas', 'Peritajes médicos', 'Evaluación de daños', 'Negociación con EPS'],
      icon: '⚕️'
    },
    {
      id: 'responsabilidad-contractual',
      title: 'Responsabilidad Contractual',
      description: 'Asesoría y representación en incumplimientos contractuales, reclamación de perjuicios por breach de contrato y responsabilidad por daños derivados de relaciones contractuales.',
      features: ['Análisis contractual', 'Cuantificación de perjuicios', 'Mediación y arbitraje', 'Litigio comercial'],
      icon: '📋'
    },
    {
      id: 'responsabilidad-estado',
      title: 'Responsabilidad del Estado',
      description: 'Reclamaciones contra entidades públicas por daños causados por acción u omisión estatal. Defendemos a ciudadanos afectados por fallas en el servicio público.',
      features: ['Reparación directa', 'Falla del servicio', 'Daño especial', 'Procedimiento administrativo'],
      icon: '🏛️'
    },
    {
      id: 'danos-propiedad',
      title: 'Daños a la Propiedad',
      description: 'Recuperación de daños materiales a bienes inmuebles y muebles causados por terceros, incluyendo daños por construcciones, inundaciones y otros eventos.',
      features: ['Avalúos técnicos', 'Inspecciones judiciales', 'Reclamación de lucro cesante', 'Gestión aseguradora'],
      icon: '🏠'
    },
    {
      id: 'responsabilidad-productos',
      title: 'Responsabilidad por Productos Defectuosos',
      description: 'Representación en casos de daños causados por productos defectuosos, incluyendo alimentos, medicamentos, electrodomésticos y otros bienes de consumo.',
      features: ['Análisis de productos', 'Cadena de responsabilidad', 'Pruebas técnicas', 'Reclamación integral'],
      icon: '📦'
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Consulta Inicial',
      description: 'Evaluamos tu caso sin costo y determinamos la viabilidad legal de tu reclamación.'
    },
    {
      step: '02',
      title: 'Investigación',
      description: 'Recopilamos pruebas, documentos y testimonios necesarios para fortalecer tu caso.'
    },
    {
      step: '03',
      title: 'Estrategia Legal',
      description: 'Desarrollamos una estrategia personalizada basada en las particularidades de tu caso.'
    },
    {
      step: '04',
      title: 'Negociación',
      description: 'Buscamos acuerdos favorables antes de llegar a instancias judiciales.'
    },
    {
      step: '05',
      title: 'Litigio',
      description: 'Si es necesario, representamos tus intereses ante los tribunales competentes.'
    },
    {
      step: '06',
      title: 'Resolución',
      description: 'Obtenemos la compensación justa y ejecutamos el cumplimiento de la sentencia.'
    }
  ];

  return (
    <LandingLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
            Especialidades
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Nuestros Servicios Legales Especializados
          </h1>
          <p className="mt-6 max-w-4xl text-lg text-blue-100">
            Ofrecemos representación legal integral en todas las áreas de responsabilidad civil, con la experiencia y dedicación que tu caso merece.
          </p>
          <div className="mt-10 flex flex-col gap-4 text-left text-xs uppercase tracking-[0.35em] text-blue-200/70 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Clock className="h-4 w-4" />
              Respuesta oportuna
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Users className="h-4 w-4" />
              Equipo multidisciplinario
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <FileText className="h-4 w-4" />
              Estrategias personalizadas
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/0 to-white/0" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              Portafolio Integral
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              Áreas de Especialización
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Cada área cuenta con un equipo dedicado, procesos trazables y acompañamiento constante para nuestros clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.35)] transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl transition duration-300 group-hover:bg-blue-400/20" />
                <div className="relative flex items-center gap-4">
                  <div className="text-4xl">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                    </div>
                <p className="relative mt-4 text-sm text-blue-100/90">{service.description}</p>
                <div className="relative mt-6 space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200/80">Incluye</h4>
                  <ul className="grid gap-2 text-sm text-blue-100/90">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                        <Shield className="h-4 w-4 text-blue-200" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    to={`/web/servicios/${service.id}`}
                  className="relative mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-blue-200 transition hover:border-white/30 hover:text-white"
                  >
                  Ver detalle del servicio
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/8 to-white/0" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              Metodología
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Nuestro Proceso Legal</h2>
            <p className="mt-4 text-lg text-blue-100">
              Un enfoque estructurado y transparente que garantiza la mejor representación en cada etapa de tu caso.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <div
                key={step.step}
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-blue-100 shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200/30 bg-blue-500/10 text-sm font-semibold text-blue-200">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                <p className="mt-4 text-sm text-blue-100/90">{step.description}</p>
                {index < processSteps.length - 1 && (
                  <div className="mt-6 h-0.5 w-full rounded-full bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24 pt-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/12 to-white/6" />
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/40 via-indigo-600/40 to-blue-600/40 px-6 py-16 text-center shadow-[0_35px_65px_rgba(15,23,42,0.45)] backdrop-blur sm:px-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">¿Necesitas Representación Legal?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Agenda una consulta gratuita y descubre cómo podemos ayudarte a obtener la compensación que mereces.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/web/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Agenda tu Consulta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Services;