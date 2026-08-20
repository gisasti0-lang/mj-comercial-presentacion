import { useApp } from '../store'
import { ruta } from '../data/ruta'
import { CAPACIDAD } from '../data/ferrocarriles'

/** Pantalla de acceso: se elige la línea antes de entrar a la presentación. */
const LINEAS = [
  {
    id: 'ferro' as const,
    n: '01',
    titulo: 'Ferroviario',
    sub: 'Vagones · Componentes · Bogies',
    desc: 'Siete tipos de vagón acotados, catálogo de 25 componentes, bogie de trocha 1676 y contenedor granero. Todo con modelo tridimensional navegable.',
    marcas: ['+9.700 vagones fabricados', '+70 años de trayectoria', 'Normas AAR'],
    imagen: '/docs/vag-tolva-pedrero.jpg',
  },
  {
    id: 'alcaldia' as const,
    n: '02',
    titulo: 'Cárceles',
    sub: 'Alcaldía penitenciaria · Sistema modular',
    desc: 'Anteproyecto de módulos penitenciarios de acero. Sistema de módulos repetibles con crecimiento longitudinal, documentado hasta el detalle constructivo.',
    marcas: ['24 plazas por tramo', 'Crecimiento modular', 'Escala 1:50'],
    imagen: '/docs/iso-porton.jpg',
  },
]

export default function Entrada() {
  const setLinea = useApp((s) => s.setLinea)

  return (
    <div className="entrada">
      <div className="entrada-fondo" />

      <header className="entrada-head entra">
        <div className="eyebrow">MJ COMERCIAL S.A. · MARÍA JUANA, SANTA FE</div>
        <h1>Presentación de proyectos<br />de alta complejidad</h1>
        <p className="entrada-lead">
          Dos verticales de negocio sostenidos por la misma ingeniería: <b>material rodante
          ferroviario</b> y <b>módulos penitenciarios de acero</b>.
        </p>
        <p>
          Setenta años fabricando en serie y a medida, bajo normas AAR y con planta de conexión
          ferroviaria propia. Cada proyecto se presenta acá con su documentación técnica y un
          modelo tridimensional que se recorre, se despieza y se corta —construido sobre las
          cotas de los planos, no sobre aproximaciones.
        </p>
      </header>

      <div className="entrada-grid entra">
        {LINEAS.map((l) => (
          <button key={l.id} className="acceso" onClick={() => setLinea(l.id)}>
            <div className="acceso-img">
              <img src={ruta(l.imagen)} alt={l.titulo} loading="lazy" />
            </div>
            <div className="acceso-cuerpo">
              <div className="n">{l.n}</div>
              <h2>{l.titulo}</h2>
              <div className="acceso-sub">{l.sub}</div>
              <p>{l.desc}</p>
              <div className="acceso-marcas">
                {l.marcas.map((m) => <span key={m}>{m}</span>)}
              </div>
              <div className="acceso-cta">ENTRAR →</div>
            </div>
          </button>
        ))}
      </div>

      <footer className="entrada-pie entra">
        {CAPACIDAD.map((c) => (
          <div key={c.k}>
            <div className="cota">{c.v}</div>
            <div className="k">{c.k}</div>
          </div>
        ))}
      </footer>
    </div>
  )
}
