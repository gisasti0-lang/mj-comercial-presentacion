import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store'
import { useFerro } from '../storeFerro'

interface Paso {
  t: string; d: string; dur: number; seccion: number
  aplicar?: () => void
}

/** Recorrido guiado por la línea ferroviaria. */
function guion(): Paso[] {
  const f = useFerro.getState()
  return [
    {
      t: 'LÍNEA FERROVIARIA', seccion: 0, dur: 6000,
      d: 'MJ Comercial S.A. — primera fábrica argentina de vagones ferroviarios. Más de 9.700 vagones fabricados y 70 años de trayectoria.',
    },
    {
      t: 'VAGÓN TOLVA PEDRERO', seccion: 1, dur: 7000,
      d: '12470 mm entre cabezales, 3140 de ancho de caja y 41 m³ de volumen útil. Descarga por seis compuertas laterales.',
      aplicar: () => { f.setVagon('tolva-pedrero'); f.setExplotadoVagon(false); f.setCorte({ activo: false }) },
    },
    {
      t: 'VAGÓN TANQUE', seccion: 1, dur: 6500,
      d: 'Trocha 1435, 12500 mm entre cabezales y 60 m³ para hidrocarburos pesados, con carga superior de depósito cisterna.',
      aplicar: () => { f.setVagon('tanque') },
    },
    {
      t: 'DESPIECE DEL VAGÓN', seccion: 1, dur: 8000,
      d: 'Caja, bastidor, equipamiento y bogies. Cada vagón monta dos bogies 1676 a la separación declarada entre centros.',
      aplicar: () => { f.setVagon('granero'); f.setExplotadoVagon(true) },
    },
    {
      t: 'COMPONENTES', seccion: 2, dur: 7000,
      d: 'Veinticinco componentes de freno, bogie y enganche, clasificados por criticidad operativa y fabricados bajo normas AAR.',
      aplicar: () => { f.setExplotadoVagon(false) },
    },
    {
      t: 'BOGIE 1676', seccion: 3, dur: 7000,
      d: 'Chapa soldada con control de marcha. Trocha 1676, distancia entre ejes 1829 mm, rueda de 953 mm y 20 t por eje.',
      aplicar: () => { f.reset() },
    },
    {
      t: 'CORTE DEL BOGIE', seccion: 3, dur: 7500,
      d: 'El corte deja ver los nidos de suspensión: cinco resortes exteriores y tres interiores por nido, con cuñas a fricción.',
      aplicar: () => { f.setCorte({ activo: true, eje: 'z', pos: 0.5, invertido: false }) },
    },
    {
      t: 'DESPIECE DEL BOGIE', seccion: 3, dur: 8000,
      d: 'Largueros, traviesa, suspensión, freno y pares montados. Ocho componentes según la especificación ET-BOGIE-1676.',
      aplicar: () => { f.setCorte({ activo: false }); f.setExplotado(true) },
    },
    {
      t: 'CONTENEDOR GRANERO', seccion: 4, dur: 7000,
      d: 'CG35 — 35 m³ sobre medida o 30 m³ en formato ISO. Tolvas a 32° y tres bocas de descarga separadas 2160 mm.',
      aplicar: () => { f.setExplotado(false); f.setCorte({ activo: false }) },
    },
    {
      t: 'DOCUMENTACIÓN', seccion: 5, dur: 6500,
      d: 'Catálogo institucional, catálogos de vagones y repuestos, y los planos originales que alimentan cada modelo.',
    },
  ]
}

export default function PresentacionFerro() {
  const paso = useApp((s) => s.pasoPres)
  const setPaso = useApp((s) => s.setPasoPres)
  const setPresentando = useApp((s) => s.setPresentando)
  const irA = useApp((s) => s.irA)
  const pausa = useRef(false)
  const t0 = useRef(performance.now())
  const barra = useRef<HTMLElement>(null)
  const pasos = useRef(guion()).current

  useEffect(() => {
    const p = pasos[paso]
    irA(p.seccion)
    p.aplicar?.()
    t0.current = performance.now()
  }, [paso, pasos, irA])

  useEffect(() => {
    let raf = 0
    const tick = (t: number) => {
      if (!pausa.current) {
        const k = (t - t0.current) / pasos[paso].dur
        if (barra.current) barra.current.style.transform = `scaleX(${Math.min(1, k)})`
        if (k >= 1) setPaso((paso + 1) % pasos.length)
      } else t0.current = t
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paso, setPaso, pasos])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresentando(false)
      if (e.key === 'ArrowRight') setPaso((paso + 1) % pasos.length)
      if (e.key === 'ArrowLeft') setPaso((paso - 1 + pasos.length) % pasos.length)
      if (e.key === ' ') { pausa.current = !pausa.current; e.preventDefault() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [paso, setPaso, setPresentando, pasos])

  const p = pasos[paso]

  return (
    <>
      <motion.div key={paso}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5, ease: [.16, 1, .3, 1] }}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 62, zIndex: 70,
          padding: '0 42px', pointerEvents: 'none',
        }}>
        <div style={{ maxWidth: 620, background: 'rgba(11,13,15,.9)', border: '1px solid var(--linea)', padding: '18px 22px' }}>
          <div className="num" style={{ marginBottom: 8 }}>
            {String(paso + 1).padStart(2, '0')} / {String(pasos.length).padStart(2, '0')}
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{p.t}</h3>
          <p style={{ fontSize: '.85rem', color: '#c2c9cf' }}>{p.d}</p>
        </div>
      </motion.div>

      <div className="pres-barra" style={{ position: 'fixed', zIndex: 71 }}>
        <button className="btn" onClick={() => setPaso((paso - 1 + pasos.length) % pasos.length)}>←</button>
        <button className="btn" onClick={() => { pausa.current = !pausa.current }}>❚❚ / ▶</button>
        <button className="btn" onClick={() => setPaso((paso + 1) % pasos.length)}>→</button>
        <div className="pres-prog"><i ref={barra as React.RefObject<HTMLElement>} style={{ transform: 'scaleX(0)' }} /></div>
        <span className="eyebrow">{p.t}</span>
        <button className="btn" onClick={() => setPresentando(false)}>SALIR ✕</button>
      </div>
    </>
  )
}
