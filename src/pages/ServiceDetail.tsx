import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Users, Shield, Phone } from 'lucide-react';
import LandingLayout from '../components/common/LandingLayout';

const ServiceDetail = () => {
  const { serviceId } = useParams();

  const serviceData: Record<string, any> = {
    'accidentes-transito': {
      title: 'Responsabilidad Civil por Accidentes de Tránsito',
      description: 'Representación legal especializada en accidentes vehiculares de todo tipo, desde colisiones menores hasta accidentes graves con lesiones personales. Nuestro equipo tiene amplia experiencia en la recuperación de compensaciones justas por daños materiales, lesiones corporales, lucro cesante y daño moral.',
      icon: '🚗',
      color: 'from-blue-500 to-blue-400',
      detailedInfo: `Los accidentes de tránsito pueden cambiar tu vida en segundos. Cuando eres víctima de un accidente causado por la negligencia de otro conductor, tienes derecho a una compensación justa que cubra todos los daños sufridos.

      En Prosejurix entendemos la complejidad de estos casos y trabajamos incansablemente para asegurar que recibas la compensación que mereces. Nuestro enfoque integral incluye la evaluación médica de lesiones, el análisis técnico del accidente, la negociación con aseguradoras y, si es necesario, la representación judicial.`,
      process: [
        'Evaluación inicial gratuita del caso',
        'Recopilación de evidencias y testimonios',
        'Análisis técnico del accidente',
        'Evaluación médica de lesiones',
        'Negociación con aseguradoras',
        'Presentación de demanda si es necesario',
        'Representación en audiencias',
        'Ejecución de la sentencia'
      ],
      faqs: [
        {
          question: '¿Qué debo hacer inmediatamente después de un accidente?',
          answer: 'Busca atención médica inmediata, documenta la escena con fotos, obtén información de contacto de testigos, no admitas culpabilidad y contacta a un abogado lo antes posible.'
        },
        {
          question: '¿Cuánto tiempo tengo para presentar una reclamación?',
          answer: 'En Colombia, el término general para reclamar por responsabilidad civil es de 3 años desde que ocurrió el daño o desde que se tuvo conocimiento del mismo.'
        },
        {
          question: '¿Qué tipos de daños puedo reclamar?',
          answer: 'Puedes reclamar daño emergente (gastos médicos, reparaciones), lucro cesante (pérdida de ingresos), daño moral (sufrimiento) y daño a la vida de relación.'
        },
        {
          question: '¿Necesito tener seguro para reclamar?',
          answer: 'No necesitas tener seguro para reclamar. La responsabilidad recae sobre quien causó el accidente y su aseguradora.'
        }
      ]
    },
    'negligencia-medica': {
      title: 'Responsabilidad Médica',
      description: 'Defensa especializada en casos de mala praxis médica, errores de diagnóstico, negligencia hospitalaria y daños por tratamientos inadecuados. Protegemos los derechos de pacientes y familias afectadas por errores médicos.',
      icon: '⚕️',
      color: 'from-emerald-500 to-teal-400',
      detailedInfo: `La confianza que depositamos en los profesionales de la salud es fundamental, pero cuando esa confianza se ve traicionada por negligencia o mala praxis, las consecuencias pueden ser devastadoras.

      En Prosejurix tenemos la experiencia y los recursos necesarios para enfrentar casos complejos de responsabilidad médica. Trabajamos con peritos médicos reconocidos y analizamos meticulosamente cada aspecto del tratamiento para determinar si hubo negligencia y cuáles fueron sus consecuencias.`,
      process: [
        'Análisis inicial de la historia clínica',
        'Consulta con peritos médicos especializados',
        'Evaluación de la atención recibida',
        'Determinación de la relación causal',
        'Cuantificación de daños y perjuicios',
        'Negociación con la institución médica',
        'Presentación de demanda si es necesario',
        'Seguimiento hasta la resolución final'
      ],
      faqs: [
        {
          question: '¿Qué constituye negligencia médica?',
          answer: 'La negligencia médica ocurre cuando un profesional de la salud no proporciona el estándar de atención esperado, causando daño al paciente.'
        },
        {
          question: '¿Cómo puedo obtener mi historia clínica?',
          answer: 'Tienes derecho a solicitar tu historia clínica completa a la institución médica. Nosotros te ayudamos en este proceso.'
        },
        {
          question: '¿Contra quién puedo demandar?',
          answer: 'Puedes demandar al médico tratante, la institución médica, la EPS o cualquier entidad responsable de la atención deficiente.'
        },
        {
          question: '¿Qué evidencia necesito para mi caso?',
          answer: 'Historia clínica completa, exámenes médicos, testimonios de otros médicos y documentación de todos los daños sufridos.'
        }
      ]
    },
    'responsabilidad-contractual': {
      title: 'Responsabilidad Contractual',
      description: 'Asesoría y representación en incumplimientos contractuales, reclamación de perjuicios por breach de contrato y responsabilidad por daños derivados de relaciones contractuales.',
      icon: '📋',
      color: 'from-purple-500 to-indigo-400',
      detailedInfo: `Los contratos son la base de las relaciones comerciales y civiles. Cuando una de las partes incumple sus obligaciones contractuales, la parte afectada tiene derecho a reclamar una compensación por los perjuicios sufridos.

      En Prosejurix analizamos meticulosamente cada contrato para identificar las obligaciones incumplidas y cuantificar los daños resultantes. Nuestro objetivo es obtener una compensación integral que incluya tanto el daño emergente como el lucro cesante.`,
      process: [
        'Análisis detallado del contrato',
        'Identificación de obligaciones incumplidas',
        'Recopilación de evidencias del incumplimiento',
        'Cuantificación de perjuicios económicos',
        'Intento de solución extrajudicial',
        'Presentación de demanda contractual',
        'Representación en proceso judicial',
        'Ejecución de la sentencia'
      ],
      faqs: [
        {
          question: '¿Qué es el incumplimiento contractual?',
          answer: 'Es cuando una de las partes no cumple total o parcialmente con las obligaciones establecidas en el contrato.'
        },
        {
          question: '¿Qué puedo reclamar por incumplimiento?',
          answer: 'Puedes reclamar el cumplimiento del contrato, la resolución del mismo, y en ambos casos, indemnización de perjuicios.'
        },
        {
          question: '¿Cuándo prescribe la acción contractual?',
          answer: 'La acción contractual prescribe en 10 años desde el incumplimiento, salvo que la ley establezca un término menor.'
        },
        {
          question: '¿Necesito intentar arreglo antes de demandar?',
          answer: 'No es obligatorio, pero es recomendable intentar una solución amigable antes de acudir a los tribunales.'
        }
      ]
    },
    'responsabilidad-estado': {
      title: 'Responsabilidad del Estado',
      description: 'Reclamaciones contra entidades públicas por daños causados por acción u omisión estatal. Defendemos a ciudadanos afectados por fallas en el servicio público.',
      icon: '🏛️',
      color: 'from-rose-500 to-orange-400',
      detailedInfo: `El Estado tiene la obligación de prestar servicios públicos de manera eficiente y segura. Cuando las entidades públicas causan daños a los ciudadanos por acción u omisión, existe responsabilidad estatal que debe ser reparada.

      En Prosejurix tenemos amplia experiencia en reclamaciones contra el Estado, conocemos los procedimientos especiales y los términos aplicables. Representamos a ciudadanos en casos de falla del servicio, daño especial y reparación directa.`,
      process: [
        'Evaluación de la responsabilidad estatal',
        'Identificación de la entidad responsable',
        'Agotamiento de la vía gubernativa',
        'Presentación de demanda de reparación directa',
        'Práctica de pruebas especializadas',
        'Audiencias ante el Tribunal Administrativo',
        'Seguimiento del proceso judicial',
        'Ejecución de la sentencia'
      ],
      faqs: [
        {
          question: '¿Cuándo es responsable el Estado?',
          answer: 'El Estado es responsable cuando causa daños por falla del servicio, daño especial o cuando actúa de manera antijurídica.'
        },
        {
          question: '¿Qué es la vía gubernativa?',
          answer: 'Es el procedimiento administrativo previo que debe agotarse antes de demandar al Estado en algunos casos.'
        },
        {
          question: '¿Cuánto tiempo tengo para demandar al Estado?',
          answer: 'El término general es de 2 años desde que ocurrió el daño o desde que se tuvo conocimiento del mismo.'
        },
        {
          question: '¿Contra qué entidades puedo demandar?',
          answer: 'Puedes demandar a cualquier entidad pública: ministerios, alcaldías, hospitales públicos, universidades públicas, etc.'
        }
      ]
    },
    'danos-propiedad': {
      title: 'Daños a la Propiedad',
      description: 'Recuperación de daños materiales a bienes inmuebles y muebles causados por terceros, incluyendo daños por construcciones, inundaciones y otros eventos.',
      icon: '🏠',
      color: 'from-amber-500 to-yellow-400',
      detailedInfo: `Los daños a la propiedad pueden ocurrir por diversas causas: construcciones vecinas, inundaciones, incendios, vandalismo o negligencia de terceros. Cuando estos daños son causados por la acción u omisión de otros, tienes derecho a una compensación completa.

      En Prosejurix evaluamos integralmente los daños a tu propiedad, trabajamos con peritos especializados en avalúos y construcción, y luchamos por obtener una compensación que cubra tanto la reparación como los perjuicios adicionales.`,
      process: [
        'Inspección técnica de los daños',
        'Avalúo profesional de la propiedad',
        'Identificación de los responsables',
        'Documentación fotográfica y testimonial',
        'Cuantificación de daños y perjuicios',
        'Negociación con responsables y aseguradoras',
        'Presentación de demanda si es necesario',
        'Seguimiento hasta la reparación completa'
      ],
      faqs: [
        {
          question: '¿Qué tipos de daños a la propiedad puedo reclamar?',
          answer: 'Puedes reclamar daños estructurales, daños a contenidos, pérdida de uso de la propiedad y disminución del valor comercial.'
        },
        {
          question: '¿Necesito un avalúo profesional?',
          answer: 'Sí, es fundamental contar con un avalúo técnico que determine el valor real de los daños sufridos.'
        },
        {
          question: '¿Puedo reclamar por lucro cesante?',
          answer: 'Sí, si la propiedad generaba ingresos (arriendo, negocio), puedes reclamar por la pérdida de esos ingresos.'
        },
        {
          question: '¿Qué evidencia debo conservar?',
          answer: 'Fotos de los daños, facturas de reparaciones, testimonios de vecinos y cualquier documento que pruebe el valor de la propiedad.'
        }
      ]
    },
    'responsabilidad-productos': {
      title: 'Responsabilidad por Productos Defectuosos',
      description: 'Representación en casos de daños causados por productos defectuosos, incluyendo alimentos, medicamentos, electrodomésticos y otros bienes de consumo.',
      icon: '📦',
      color: 'from-teal-500 to-cyan-400',
      detailedInfo: `Los consumidores tienen derecho a productos seguros y de calidad. Cuando un producto defectuoso causa daños, tanto el fabricante como el distribuidor pueden ser responsables de compensar a las víctimas.

      En Prosejurix manejamos casos de responsabilidad por productos defectuosos, desde alimentos contaminados hasta electrodomésticos peligrosos. Investigamos toda la cadena de producción y distribución para identificar a todos los responsables.`,
      process: [
        'Preservación del producto defectuoso',
        'Análisis técnico del defecto',
        'Identificación de la cadena de responsabilidad',
        'Evaluación médica de daños (si aplica)',
        'Investigación del proceso de fabricación',
        'Negociación con fabricantes y aseguradoras',
        'Presentación de demanda si es necesario',
        'Seguimiento hasta la compensación'
      ],
      faqs: [
        {
          question: '¿Qué constituye un producto defectuoso?',
          answer: 'Un producto es defectuoso cuando no cumple con los estándares de seguridad esperados o tiene fallas de diseño, fabricación o advertencia.'
        },
        {
          question: '¿Contra quién puedo demandar?',
          answer: 'Puedes demandar al fabricante, distribuidor, importador o vendedor del producto defectuoso.'
        },
        {
          question: '¿Necesito conservar el producto?',
          answer: 'Sí, es crucial conservar el producto defectuoso como evidencia para el análisis técnico.'
        },
        {
          question: '¿Qué daños puedo reclamar?',
          answer: 'Puedes reclamar daños personales, daños a la propiedad, gastos médicos y lucro cesante.'
        }
      ]
    }
  };

  const service = serviceData[serviceId || ''];

  if (!service) {
    return (
      <LandingLayout>
        <div className="mx-auto max-w-3xl px-4 py-32 text-center text-white">
          <h1 className="text-4xl font-bold">Servicio no encontrado</h1>
          <Link to="/web/servicios" className="mt-6 inline-flex items-center text-blue-200 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a servicios
        </Link>
      </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20`} />
        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Link 
          to="/web/servicios" 
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80 transition hover:border-white/20 hover:bg-white/10"
        >
            <ArrowLeft className="h-4 w-4" /> Volver a Servicios
        </Link>
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-lg text-white">
                <span className="text-3xl">{service.icon}</span>
                <span className="font-semibold uppercase tracking-[0.35em] text-blue-200/80">Especialidad</span>
      </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl">{service.title}</h1>
              <p className="max-w-2xl text-lg text-blue-100">{service.description}</p>
            </div>
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.45)] backdrop-blur">
              <h3 className="text-xl font-semibold text-white">¿Necesitas ayuda con este caso?</h3>
              <div className="mt-6 space-y-4 text-blue-100/90">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-200" /> Consulta gratuita inicial
          </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-200" /> Equipo especializado
        </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-200" /> Honorarios condicionales
              </div>
            </div>
              <div className="mt-6 space-y-3">
                <Link
                  to="/web/contacto"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Agenda tu Consulta
                </Link>
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> WhatsApp Inmediato
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/0 to-white/0" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_30px_60px_rgba(15,23,42,0.45)] backdrop-blur">
            <h2 className="text-3xl font-bold text-white">Información Detallada</h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-blue-100">
              {service.detailedInfo.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph.trim()}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/8 to-white/0" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
              Ruta Estratégica
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white">Proceso Legal para {service.title}</h2>
            <p className="mt-4 text-lg text-blue-100">
              Cada etapa se ejecuta con controles de calidad, seguimiento digital y transparencia absoluta para nuestros clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step: string, index: number) => (
              <div
                key={step}
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-blue-100 shadow-[0_20px_55px_rgba(15,23,42,0.45)] backdrop-blur"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200/40 bg-blue-500/20 text-sm font-semibold text-blue-100">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/10 to-white/0" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200/80">
            Preguntas Frecuentes
            </span>
            <h2 className="mt-6 text-3xl font-bold text-white">Resolvemos tus dudas</h2>
            <p className="mt-4 text-lg text-blue-100">
              Información clave para que tomes decisiones con seguridad y respaldo jurídico.
            </p>
          </div>
          <div className="space-y-6">
            {service.faqs.map((faq: any) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-blue-100 shadow-[0_25px_60px_rgba(15,23,42,0.45)] backdrop-blur"
              >
                <h3 className="flex items-start gap-3 text-lg font-semibold text-white">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  {faq.question}
                </h3>
                <p className="mt-3 pl-8 text-sm text-blue-100/90">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24 pt-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/14 to-white/8" />
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/40 via-indigo-600/40 to-blue-600/40 px-6 py-16 text-center shadow-[0_35px_70px_rgba(15,23,42,0.55)] backdrop-blur sm:px-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Inicia tu Reclamo Hoy</h2>
          <p className="mt-4 text-lg text-blue-100">
            No esperes más para defender tus derechos. Cada día cuenta cuando se trata de tu caso.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/web/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            Agenda tu Consulta Gratuita
          </Link>
            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            >
              WhatsApp Inmediato
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default ServiceDetail;