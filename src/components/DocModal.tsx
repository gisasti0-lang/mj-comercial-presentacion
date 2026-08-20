import { useEffect, useState } from 'react'
import { useApp } from '../store'
import { docPorId } from '../data/documentos'
import { ruta } from '../data/ruta'

export default function DocModal() {
  const doc = useApp((s) => s.doc)
  const abrirDoc = useApp((s) => s.abrirDoc)
  const [zoom, setZoom] = useState(1)

  useEffect(() => { setZoom(1) }, [doc])
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') abrirDoc(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [abrirDoc])

  const d = doc ? docPorId(doc) : null
  if (!d || !d.archivo) return null

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) abrirDoc(null) }}>
      <div className="modal-h">
        <div>
          <div className="t">{d.codigo} · {d.titulo}</div>
          <div className="s">ESCALA {d.escala} · MEDIDAS GENERALES EN MM · MJ COMERCIAL</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.35))}>−</button>
          <button className="btn" onClick={() => setZoom(1)}>AJUSTAR</button>
          <button className="btn" onClick={() => setZoom((z) => Math.min(5, z + 0.35))}>+</button>
          <a className="btn" href={ruta(d.archivo)} target="_blank" rel="noreferrer">ABRIR</a>
          <button className="btn" onClick={() => abrirDoc(null)}>CERRAR ✕</button>
        </div>
      </div>
      <div className="modal-b">
        <img src={ruta(d.archivo)} alt={d.titulo}
          style={{ width: `${zoom * 100}%`, maxWidth: zoom === 1 ? '100%' : 'none', height: 'auto' }} />
      </div>
    </div>
  )
}
