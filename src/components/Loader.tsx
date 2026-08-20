import { useEffect, useState } from 'react'
import { useApp } from '../store'

const PASOS = ['STRUCTURE', 'MODULES', 'SYSTEMS', '3D MODEL']

export default function Loader() {
  const cargado = useApp((s) => s.cargado)
  const setCargado = useApp((s) => s.setCargado)
  const [p, setP] = useState(0)

  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const dur = 2300
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      setP(Math.round(k * 100))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    /* requestAnimationFrame se estrangula con la pestaña en segundo plano:
       el pase a "listo" no puede depender de él. */
    const fin = setTimeout(() => { setP(100); setCargado(true) }, dur + 380)
    return () => { cancelAnimationFrame(raf); clearTimeout(fin) }
  }, [setCargado])

  const activos = Math.floor((p / 100) * PASOS.length + 0.001)

  return (
    <div className={`loader${cargado ? ' off' : ''}`} aria-hidden={cargado}>
      {/* sección transversal esquemática: 3000 + 3000 + 3000, techo superior sobre patio */}
      <svg className="loader-svg" viewBox="0 0 380 150" fill="none">
        <g style={{ ['--len' as string]: 900 }}>
          <line x1="20" y1="128" x2="360" y2="128" style={{ animationDelay: '0s' }} />
          <rect x="20" y="66" width="113" height="62" style={{ animationDelay: '.12s' }} />
          <rect x="133" y="66" width="114" height="62" style={{ animationDelay: '.24s' }} />
          <rect x="247" y="66" width="113" height="62" style={{ animationDelay: '.36s' }} />
          <path d="M14 66 L133 58" style={{ animationDelay: '.5s' }} />
          <path d="M366 66 L247 58" style={{ animationDelay: '.5s' }} />
          <path d="M133 46 L133 58 M247 46 L247 58" style={{ animationDelay: '.64s' }} />
          <path d="M124 46 L190 30 L256 46" style={{ animationDelay: '.78s' }} />
          <path d="M150 46 L150 58 M170 46 L170 58 M190 46 L190 58 M210 46 L210 58 M230 46 L230 58"
            style={{ animationDelay: '.92s' }} />
          <path d="M40 128 L40 138 M100 128 L100 138 M280 128 L280 138 M340 128 L340 138"
            style={{ animationDelay: '1.02s' }} />
        </g>
      </svg>

      <div className="loader-barra"><i style={{ width: `${p}%` }} /></div>

      <div className="loader-pasos">
        {PASOS.map((s, i) => (
          <div key={s} className={`loader-paso${i < activos ? ' on' : ''}`}>
            <span>{s}</span><b>{i < activos ? 'OK' : '··'}</b>
          </div>
        ))}
        <div className={`loader-paso${p >= 100 ? ' on' : ''}`} style={{ marginTop: 8 }}>
          <span>{p >= 100 ? '100% — READY' : 'LOADING PROJECT'}</span><b>{p}%</b>
        </div>
      </div>

      <div className="loader-tit">
        <div className="a">ALCALDÍA PENITENCIARIA</div>
        <div className="b">MODULAR STEEL SYSTEM</div>
      </div>
    </div>
  )
}
