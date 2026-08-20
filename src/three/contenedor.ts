import * as THREE from 'three'
import { crearMateriales, type Materiales } from './materials'

/* ═══════════════════════════════════════════════════════════════
   CONTENEDOR GRANERO 35 m³ — CG35
   Geometría derivada del plano CG35 (MJ COMERCIAL, 1:20, emisión 2).
   Unidades internas: milímetros. Origen: centro del contenedor,
   Y=0 en la cara inferior de las bocas de descarga.
   ═══════════════════════════════════════════════════════════════ */

export type CatCG35 = 'ESTRUCTURA' | 'CERRAMIENTO' | 'TOLVAS' | 'DESCARGA' | 'CARGA' | 'ACCESOS'

export const CATS_CG35: { id: CatCG35; label: string; on: boolean }[] = [
  { id: 'ESTRUCTURA', label: 'ESTRUCTURA', on: true },
  { id: 'CERRAMIENTO', label: 'CERRAMIENTO', on: true },
  { id: 'TOLVAS', label: 'TOLVAS', on: true },
  { id: 'DESCARGA', label: 'BOCAS DE DESCARGA', on: true },
  { id: 'CARGA', label: 'BOCA DE CARGA', on: true },
  { id: 'ACCESOS', label: 'ACCESOS', on: true },
]

/* ── Cotas del plano (mm) ───────────────────────────────────────── */
const LARGO = 6000          // [cota] entre cabezales
const ANCHO = 2590          // [cota] ancho del cuerpo
const ANCHO_BASE = 2259     // [cota] ancho en la base
const ENTRE_SOLERAS = 3000  // [cota] entre soleras
const H_MAX = 2868          // [cota] altura máxima
const H_PASARELA = 2585     // [cota] altura de pasarela
const BOCA_CARGA = 5674     // [cota] largo de boca de carga
const PASO_BOCAS = 2160     // [cota] separación entre bocas de descarga
const ANG_TOLVA = 32        // [cota] ángulo de tolva

const H_SOLERA = 300        // [medido] altura del bastidor inferior
const H_TOLVA_ALTA = 1180   // [medido] arranque de tolva sobre la solera
const ESP = 60              // [medido] espesor de chapa estructural representado

export interface PiezaCG35 {
  nombre: string
  categoria: CatCG35
  espec?: string
  origen: 'cota' | 'medido'
}

export interface ModeloCG35 {
  root: THREE.Group
  /** Hojas pivotantes de las bocas de descarga, para animar la apertura. */
  compuertas: THREE.Group[]
  grupos: Record<CatCG35, THREE.Group>
  materiales: Materiales
  radio: number
  dispose(): void
}

const S = 0.001

function caja(
  w: number, h: number, d: number, cx: number, cy: number, cz: number,
  mat: THREE.Material, o: PiezaCG35 & { rot?: [number, number, number] },
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat)
  m.position.set(cx * S, cy * S, cz * S)
  if (o.rot) m.rotation.set(...o.rot)
  m.castShadow = m.receiveShadow = true
  const { rot: _r, ...p } = o
  m.userData = { ...p }
  return m
}

export function construirCG35(materiales?: Materiales): ModeloCG35 {
  const M = materiales ?? crearMateriales()
  const root = new THREE.Group()
  const grupos = {} as Record<CatCG35, THREE.Group>
  for (const c of CATS_CG35) {
    const g = new THREE.Group(); g.name = c.id; g.visible = c.on
    grupos[c.id] = g; root.add(g)
  }
  const add = (c: CatCG35, o: THREE.Object3D) => grupos[c].add(o)

  /* ── Bastidor inferior — 3000 entre soleras [cota] ────────────── */
  for (const sx of [-1, 1]) {
    add('ESTRUCTURA', caja(160, H_SOLERA, LARGO, sx * (ENTRE_SOLERAS / 2 - 80), H_SOLERA / 2, 0, M.acero, {
      nombre: 'Solera', categoria: 'ESTRUCTURA', origen: 'cota',
      espec: 'Separación entre soleras 3000 mm',
    }))
  }
  /* travesaños del bastidor, alineados con las bocas de descarga */
  for (const z of [-LARGO / 2 + 80, -PASO_BOCAS, 0, PASO_BOCAS, LARGO / 2 - 80]) {
    add('ESTRUCTURA', caja(ENTRE_SOLERAS, 140, 150, 0, H_SOLERA - 70, z, M.acero, {
      nombre: 'Travesaño de bastidor', categoria: 'ESTRUCTURA', origen: 'medido',
    }))
  }
  /* cabezales */
  for (const sz of [-1, 1]) {
    add('ESTRUCTURA', caja(ANCHO, 420, 120, 0, H_SOLERA + 210, sz * (LARGO / 2 - 60), M.acero, {
      nombre: 'Cabezal', categoria: 'ESTRUCTURA', origen: 'cota',
      espec: 'Largo entre cabezales 6000 mm',
    }))
  }
  /* piezas de esquina ISO */
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (const y of [H_SOLERA + 90, H_PASARELA - 90]) {
      add('ESTRUCTURA', caja(180, 180, 180, sx * (ANCHO / 2 - 90), y, sz * (LARGO / 2 - 90), M.aceroClaro, {
        nombre: 'Pieza de esquina', categoria: 'ESTRUCTURA', origen: 'medido',
        espec: 'Cantonera tipo ISO para izaje y amarre',
      }))
    }
  }
  /* columnas de esquina */
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add('ESTRUCTURA', caja(120, H_PASARELA - H_SOLERA, 120, sx * (ANCHO / 2 - 60), (H_SOLERA + H_PASARELA) / 2, sz * (LARGO / 2 - 60), M.acero, {
      nombre: 'Columna de esquina', categoria: 'ESTRUCTURA', origen: 'medido',
    }))
  }

  /* ── Cerramiento lateral ──────────────────────────────────────── */
  const hCuerpo = H_PASARELA - (H_SOLERA + H_TOLVA_ALTA)
  for (const sx of [-1, 1]) {
    add('CERRAMIENTO', caja(ESP, hCuerpo, LARGO - 160, sx * (ANCHO / 2), H_SOLERA + H_TOLVA_ALTA + hCuerpo / 2, 0, M.chapaOndulada, {
      nombre: 'Lateral', categoria: 'CERRAMIENTO', origen: 'cota',
      espec: 'Ancho del cuerpo 2590 mm',
    }))
    /* faldón inferior: del ancho de cuerpo al ancho de base 2259 [cota] */
    add('CERRAMIENTO', caja(ESP, H_TOLVA_ALTA / Math.cos(0.26), LARGO - 160, sx * (ANCHO + ANCHO_BASE) / 4, H_SOLERA + H_TOLVA_ALTA / 2, 0, M.chapaLisa, {
      nombre: 'Faldón lateral', categoria: 'CERRAMIENTO', origen: 'cota',
      espec: 'Transición de 2590 mm a 2259 mm en la base',
      rot: [0, 0, sx * 0.26],
    }))
  }
  for (const sz of [-1, 1]) {
    add('CERRAMIENTO', caja(ANCHO - 160, H_PASARELA - H_SOLERA - 100, ESP, 0, (H_SOLERA + H_PASARELA) / 2 + 50, sz * (LARGO / 2), M.chapaOndulada, {
      nombre: 'Frente', categoria: 'CERRAMIENTO', origen: 'medido',
    }))
  }

  /* ── Techo a dos aguas — 2868 altura máxima [cota] ────────────── */
  {
    const semi = ANCHO / 2
    const ang = Math.atan((H_MAX - H_PASARELA) / semi)
    for (const sx of [-1, 1]) {
      add('CERRAMIENTO', caja(semi / Math.cos(ang), 50, LARGO, sx * semi / 2, (H_PASARELA + H_MAX) / 2, 0, M.cubierta, {
        nombre: 'Techo', categoria: 'CERRAMIENTO', origen: 'cota',
        espec: 'Altura máxima 2868 mm · altura de pasarela 2585 mm',
        rot: [0, 0, sx > 0 ? -ang : ang],
      }))
    }
  }

  /* ── Tolvas a 32° [cota] ──────────────────────────────────────── */
  {
    const ang = (ANG_TOLVA * Math.PI) / 180
    const caida = (ANCHO_BASE / 2 - 420) * Math.tan(ang)
    const largoFaldon = (ANCHO_BASE / 2 - 420) / Math.cos(ang)
    for (const sx of [-1, 1]) {
      add('TOLVAS', caja(largoFaldon, 40, LARGO - 200, sx * (ANCHO_BASE / 4 + 105), H_SOLERA + H_TOLVA_ALTA - caida / 2, 0, M.chapaInterior, {
        nombre: 'Faldón de tolva', categoria: 'TOLVAS', origen: 'cota',
        espec: 'Ángulo de tolva 32° — descarga por gravedad',
        rot: [0, 0, sx > 0 ? ang : -ang],
      }))
    }
    /* tabiques transversales entre bocas */
    for (const z of [-PASO_BOCAS / 2 - 540, PASO_BOCAS / 2 + 540, -LARGO / 2 + 300, LARGO / 2 - 300]) {
      add('TOLVAS', caja(ANCHO_BASE - 200, H_TOLVA_ALTA - 120, 40, 0, H_SOLERA + H_TOLVA_ALTA / 2, z, M.chapaInterior, {
        nombre: 'Tabique de tolva', categoria: 'TOLVAS', origen: 'medido',
      }))
    }
  }

  /* ── Bocas de descarga — 3 a 2160 mm [cota] ──────────────────── */
  const compuertas: THREE.Group[] = []
  for (const z of [-PASO_BOCAS, 0, PASO_BOCAS]) {
    add('DESCARGA', caja(840, H_SOLERA - 40, 700, 0, (H_SOLERA - 40) / 2 + 20, z, M.acero, {
      nombre: 'Boca de descarga', categoria: 'DESCARGA', origen: 'cota',
      espec: '3 bocas separadas 2160 mm entre ejes',
    }))
    /* Dos hojas por boca, con bisagra en los bordes. El plano indica descarga
       por gravedad con compuertas inferiores, pero no acota el mecanismo:
       la apertura es representativa. */
    for (const lado of [-1, 1]) {
      const pivote = new THREE.Group()
      pivote.position.set(lado * 440 * S, 30 * S, z * S)
      pivote.userData.lado = lado
      pivote.add(caja(440, 46, 760, -lado * 220, 0, 0, M.aceroClaro, {
        nombre: 'Compuerta de descarga', categoria: 'DESCARGA', origen: 'medido',
        espec: 'Descarga por gravedad con compuertas inferiores. Mecanismo de apertura representativo.',
      }))
      grupos.DESCARGA.add(pivote)
      compuertas.push(pivote)
    }
  }

  /* ── Boca de carga — 5674 mm [cota] ──────────────────────────── */
  add('CARGA', caja(600, 90, BOCA_CARGA, 0, H_MAX - 20, 0, M.aceroClaro, {
    nombre: 'Boca de carga', categoria: 'CARGA', origen: 'cota',
    espec: 'Largo de boca de carga 5674 mm',
  }))
  for (let i = 0; i < 7; i++) {
    const z = -BOCA_CARGA / 2 + 200 + i * ((BOCA_CARGA - 400) / 6)
    add('CARGA', caja(150, 130, 90, 300, H_MAX + 40, z, M.acero, {
      nombre: 'Cierre de tapa', categoria: 'CARGA', origen: 'medido',
    }))
  }

  /* ── Accesos: escalera y pasarela ─────────────────────────────── */
  for (let i = 0; i < 6; i++) {
    add('ACCESOS', caja(60, 40, 420, -(ANCHO / 2 + 40), H_SOLERA + 260 + i * 380, -LARGO / 2 + 620, M.acero, {
      nombre: 'Escalera de acceso', categoria: 'ACCESOS', origen: 'medido',
    }))
  }
  for (const sx of [-1, 1]) {
    add('ACCESOS', caja(60, 60, LARGO - 400, sx * (ANCHO / 2 - 30), H_PASARELA + 30, 0, M.acero, {
      nombre: 'Pasarela', categoria: 'ACCESOS', origen: 'cota',
      espec: 'Altura de pasarela 2585 mm',
    }))
  }

  /* ── Explosión técnica ────────────────────────────────────────── */
  const DIR: Record<CatCG35, [number, number, number]> = {
    CARGA: [0, 1, 0], CERRAMIENTO: [0, 0.3, 0], ACCESOS: [-1, 0.2, 0],
    TOLVAS: [0, -0.2, 0], ESTRUCTURA: [0, -0.5, 0], DESCARGA: [0, -1, 0],
  }
  const MAG: Record<CatCG35, number> = {
    CARGA: 2.2, CERRAMIENTO: 2.6, ACCESOS: 1.6, TOLVAS: 1.1, ESTRUCTURA: 1.0, DESCARGA: 1.5,
  }
  for (const c of CATS_CG35) {
    grupos[c.id].traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const cat = (o.userData.categoria ?? c.id) as CatCG35
      const d = new THREE.Vector3(...DIR[cat])
      if (cat === 'CERRAMIENTO') {
        const p = new THREE.Vector3(); o.getWorldPosition(p)
        d.x = Math.abs(p.x) > 300 ? Math.sign(p.x) : 0
        d.z = Math.abs(p.z) > 2600 ? Math.sign(p.z) * 0.9 : 0
      }
      o.userData.base = o.position.clone()
      o.userData.explode = d.normalize().multiplyScalar(MAG[cat])
      o.userData.categoria = cat
    })
  }

  return {
    root, grupos, materiales: M, compuertas,
    radio: Math.hypot(ENTRE_SOLERAS / 2, LARGO / 2, H_MAX) * S,
    dispose() {
      root.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() })
      if (!materiales) M.dispose()
    },
  }
}

export const DIMS_CG35 = { LARGO, ANCHO, ANCHO_BASE, ENTRE_SOLERAS, H_MAX, H_PASARELA, BOCA_CARGA, PASO_BOCAS, ANG_TOLVA }
