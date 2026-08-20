import { SecHead, Lamina, Fila, Ficha, Aviso } from '../components/ui'
import PlantaInteractiva, { PanelZona } from '../components/PlantaInteractiva'
import { useApp, PRESETS_CORTE } from '../store'
import { COTAS, NIVELES, VERIFICACIONES } from '../data/project'

const VISTAS = [
  { id: 'aerea', l: 'VISTA AÉREA' }, { id: 'planta', l: 'PLANTA' },
  { id: 'frontal', l: 'VISTA FRONTAL' }, { id: 'lateral', l: 'VISTA LATERAL' },
] as const

export default function Conjunto() {
  const s = useApp()

  return (
    <div className="wrap-ancho">
      <SecHead n="03" titulo="Conjunto"
        bajada="El edificio completo: modelo tridimensional, planta interactiva y cortes de la documentación." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(320px,.85fr)', gap: 30, alignItems: 'start' }}
        className="conjunto-grid">
        <div>
          {/* ancla del visor 3D global */}
          <div id="visor-anchor" style={{ width: '100%', aspectRatio: '16/11', border: '1px solid var(--linea)', background: '#0e1114' }} />

          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {VISTAS.map((v) => (
              <button key={v.id} className={`btn${s.vista === v.id && !s.corte.activo ? ' on' : ''}`}
                onClick={() => { s.setCorte({ activo: false }); s.setVista(v.id) }}>{v.l}</button>
            ))}
            {PRESETS_CORTE.map((p) => (
              <button key={p.id} className="btn" title={p.desc} onClick={() => s.cortePreset(p.id)}>
                {p.label}
              </button>
            ))}
            <button className="btn" onClick={() => s.irA(7)}>ABRIR VISOR COMPLETO →</button>
          </div>

          <div className="grid g2" style={{ marginTop: 30, alignItems: 'start' }}>
            <Lamina id="elev-longitudinal" />
            <Lamina id="elev-transversal" />
            <Lamina id="seccion-bb" />
            <Lamina id="elev-frontal" />
          </div>
        </div>

        <div style={{ position: 'sticky', top: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>PLANTA INTERACTIVA — SECCIÓN A-A</div>
          <div style={{ border: '1px solid var(--linea)', background: '#0e1114', padding: 16 }}>
            <PlantaInteractiva compacta />
          </div>
          <p style={{ fontSize: '.72rem', marginTop: 9, color: '#7d858c' }}>
            Seleccioná una zona para ver su información y desplazar la cámara del modelo hacia ese sector.
          </p>
          <PanelZona />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--linea)', marginTop: 46, paddingTop: 40 }}>
        <div className="grid g3" style={{ alignItems: 'start' }}>
          <Ficha titulo="COTAS GENERALES">
            <Fila k="Ancho" v={`${COTAS.celaduriaAncho.valor} mm`} f="cota" />
            <Fila k="Largo (unidad mínima)" v={`${COTAS.conjuntoLargo.valor} mm`} f="cota" />
            <Fila k="Altura máxima" v={`${COTAS.alturaMaxima.valor} mm`} f="cota" />
            <Fila k="Altura interior" v={`${COTAS.alturaInterior.valor} mm`} f="cota" />
            <Fila k="Faja superior" v={`${COTAS.fajaSuperior.valor} mm`} f="cota" />
          </Ficha>

          <Ficha titulo="NIVELES DEL MODELO" extra={<span className="cota">mm s/ piso</span>}>
            {Object.entries(NIVELES).map(([k, v]) => (
              <Fila key={k} k={v.nota ?? k} v={`${v.valor > 0 ? '+' : ''}${v.valor}`} f={v.fuente} />
            ))}
          </Ficha>

          <Ficha titulo="VERIFICACIÓN GEOMÉTRICA">
            {VERIFICACIONES.map((v) => (
              <div className="fila" key={v.texto}>
                <span className="k">{v.texto}</span>
                <span className="v" style={{ color: '#9ec4a8' }}>{v.valor}</span>
              </div>
            ))}
            <p style={{ fontSize: '.7rem', marginTop: 12, color: '#7d858c' }}>
              La lámina se verificó a escala exacta 1:50 (9000 mm = 510,0 pt). Las cotas del modelo
              se contrastaron contra el dibujo.
            </p>
          </Ficha>
        </div>

        <div style={{ marginTop: 24 }}>
          <Aviso titulo="ORIENTACIÓN">
            El plano no indica orientación cardinal. La brújula del visor referencia el extremo de
            celaduría como frente del conjunto — es una referencia relativa del modelo, no una
            orientación del proyecto.
          </Aviso>
        </div>
      </div>
    </div>
  )
}
