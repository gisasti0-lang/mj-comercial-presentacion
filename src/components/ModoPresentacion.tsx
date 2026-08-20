import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store'

interface Paso {
  t: string; d: string; dur: number
  aplicar: (s: ReturnType<typeof useApp.getState>) => void
}

const PASOS: Paso[] = [
  {
    t: 'EL CONJUNTO', d: 'Unidad mínima: módulo de celaduría, dos módulos de celdas enfrentados y patio/corredor. 15000 × 9000 mm.',
    dur: 7000,
    aplicar: (s) => { s.reset(); s.setVista('aerea') },
  },
  {
    t: 'DISPOSICIÓN GENERAL', d: 'Planta del conjunto — la lámina la identifica como SECCIÓN A-A, escala 1:50.',
    dur: 6000,
    aplicar: (s) => { s.setCorte({ activo: false }); s.setVista('planta') },
  },
  {
    t: 'ELEVACIÓN LONGITUDINAL', d: 'Celaduría 3000 mm + módulo de celdas 12000 mm. Altura máxima 3770 mm.',
    dur: 6000,
    aplicar: (s) => { s.setVista('lateral') },
  },
  {
    t: 'SECCIÓN B-B', d: 'Corte transversal: celdas enfrentadas, patio/corredor central y faja de reja superior de 500 mm.',
    dur: 7000,
    aplicar: (s) => { s.cortePreset('B-B') },
  },
  {
    t: 'INSTALACIONES', d: 'Acometidas de electricidad, agua fría y cloaca en la parte trasera, y acceso de plomería. El resto del trazado está POR DEFINIR.',
    dur: 7000,
    aplicar: (s) => {
      s.setCorte({ activo: false }); s.setVista('aerea')
      s.setModoInstalaciones(true)
      if (!s.instalaciones.cloacal) s.toggleInstalacion('cloacal')
      if (!s.instalaciones['agua-fria']) s.toggleInstalacion('agua-fria')
    },
  },
  {
    t: 'SISTEMA CONSTRUCTIVO', d: 'Despiece del sistema: cubierta, cerramientos, estructura de acero, piso y apoyos de nivelación.',
    dur: 9000,
    aplicar: (s) => { s.setModoInstalaciones(false); s.setVista('aerea'); s.setExplotado(true) },
  },
  {
    t: 'CRECIMIENTO MODULAR', d: 'El conjunto crece sumando módulos de celdas en sentido longitudinal, prolongando el corredor central.',
    dur: 9000,
    aplicar: (s) => { s.setExplotado(false); s.setVista('aerea'); s.setTramos(4) },
  },
  {
    t: 'MODELO COMPLETO', d: 'ANTEPROYECTO ALCALDÍA PENITENCIARIA · MJ COMERCIAL · Sistema modular de acero.',
    dur: 7000,
    aplicar: (s) => { s.setTramos(1); s.setVista('aerea') },
  },
]

export default function ModoPresentacion() {
  const paso = useApp((s) => s.pasoPres)
  const setPaso = useApp((s) => s.setPasoPres)
  const setPresentando = useApp((s) => s.setPresentando)
  const pausa = useRef(false)
  const t0 = useRef(performance.now())
  const barra = useRef<HTMLElement>(null)

  useEffect(() => {
    PASOS[paso].aplicar(useApp.getState())
    t0.current = performance.now()
  }, [paso])

  useEffect(() => {
    let raf = 0
    const tick = (t: number) => {
      if (!pausa.current) {
        const k = (t - t0.current) / PASOS[paso].dur
        if (barra.current) barra.current.style.transform = `scaleX(${Math.min(1, k)})`
        if (k >= 1) setPaso((paso + 1) % PASOS.length)
      } else {
        t0.current = t - 0
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paso, setPaso])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresentando(false)
      if (e.key === 'ArrowRight') setPaso((paso + 1) % PASOS.length)
      if (e.key === 'ArrowLeft') setPaso((paso - 1 + PASOS.length) % PASOS.length)
      if (e.key === ' ') { pausa.current = !pausa.current; e.preventDefault() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [paso, setPaso, setPresentando])

  const p = PASOS[paso]

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={paso}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: .6, ease: [.16, 1, .3, 1] }}
          style={{ position: 'absolute', left: 42, bottom: 92, maxWidth: 520, pointerEvents: 'none' }}>
          <div className="num" style={{ marginBottom: 10 }}>
            {String(paso + 1).padStart(2, '0')} / {String(PASOS.length).padStart(2, '0')}
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: 12, textShadow: '0 2px 24px rgba(0,0,0,.7)' }}>{p.t}</h2>
          <p style={{ fontSize: '.92rem', color: '#cfd6dc', textShadow: '0 1px 14px rgba(0,0,0,.8)' }}>{p.d}</p>
        </motion.div>
      </AnimatePresence>

      <div className="pres-barra">
        <button className="btn" onClick={() => setPaso((paso - 1 + PASOS.length) % PASOS.length)}>←</button>
        <button className="btn" onClick={() => { pausa.current = !pausa.current }}>❚❚ / ▶</button>
        <button className="btn" onClick={() => setPaso((paso + 1) % PASOS.length)}>→</button>
        <div className="pres-prog"><i ref={barra as React.RefObject<HTMLElement>} style={{ transform: 'scaleX(0)' }} /></div>
        <span className="eyebrow">{p.t}</span>
        <button className="btn" onClick={() => setPresentando(false)}>SALIR ✕</button>
      </div>
    </>
  )
}
