import * as THREE from 'three'
import { crearMateriales, type Materiales } from './materials'
import { construirBogie } from './bogie'
import type { VagonAcotado, TipoCaja } from '../data/ferrocarriles'

/* ═══════════════════════════════════════════════════════════════
   VAGÓN PARAMÉTRICO
   El bastidor y la caja se generan con las cotas declaradas de cada
   tipo; los bogies son el modelo 1676 documentado, ubicado según la
   cota «entre centro de bogies». Unidades: milímetros. Y=0 en riel.
   ═══════════════════════════════════════════════════════════════ */

export type CatVagon = 'BOGIES' | 'BASTIDOR' | 'CAJA' | 'EQUIPAMIENTO'

export const CATS_VAGON: { id: CatVagon; label: string; on: boolean }[] = [
  { id: 'BOGIES', label: 'BOGIES', on: true },
  { id: 'BASTIDOR', label: 'BASTIDOR', on: true },
  { id: 'CAJA', label: 'CAJA', on: true },
  { id: 'EQUIPAMIENTO', label: 'EQUIPAMIENTO', on: true },
]

/** Altura de plataforma sobre riel. Es la única cota vertical de bastidor
 *  que declara la documentación (vagón portacontenedor) y se toma como
 *  referencia de la familia. */
const DECK = 1208
const H_BASTIDOR = 300
const S = 0.001

export interface PiezaVagon {
  nombre: string; categoria: CatVagon; espec?: string
}

export interface ModeloVagon {
  root: THREE.Group
  grupos: Record<CatVagon, THREE.Group>
  materiales: Materiales
  radio: number
  dispose(): void
}

/** Escala las UV para que el mapa de corrugado tenga densidad constante,
 *  sin importar el tamaño de la pieza. */
function escalarUV(g: THREE.BufferGeometry, su: number, sv: number) {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
  uv.needsUpdate = true
  return g
}

function caja(
  w: number, h: number, d: number, cx: number, cy: number, cz: number,
  mat: THREE.Material, o: PiezaVagon & { rot?: [number, number, number]; uv?: [number, number] },
) {
  const geo = new THREE.BoxGeometry(w * S, h * S, d * S)
  if (o.uv) escalarUV(geo, o.uv[0], o.uv[1])
  const m = new THREE.Mesh(geo, mat)
  m.position.set(cx * S, cy * S, cz * S)
  if (o.rot) m.rotation.set(...o.rot)
  m.castShadow = m.receiveShadow = true
  const { rot: _r, uv: _u, ...p } = o
  m.userData = { ...p }
  return m
}

function cilindro(
  r: number, h: number, cx: number, cy: number, cz: number,
  mat: THREE.Material, o: PiezaVagon & { rot?: [number, number, number] },
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, 36), mat)
  m.position.set(cx * S, cy * S, cz * S)
  if (o.rot) m.rotation.set(...o.rot)
  m.castShadow = m.receiveShadow = true
  const { rot: _r, ...p } = o
  m.userData = { ...p }
  return m
}

/** Cilindro con ficha de pieza, para los detalles del equipamiento. */
function cyl2(
  r: number, h: number, mat: THREE.Material, x: number, y: number, z: number,
  o: PiezaVagon, rot?: [number, number, number],
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * S, r * S, h * S, 28), mat)
  m.position.set(x * S, y * S, z * S)
  if (rot) m.rotation.set(...rot)
  m.castShadow = m.receiveShadow = true
  m.userData = { ...o }
  return m
}

/* ── Caja según tipo ────────────────────────────────────────────── */
function construirCaja(M: Materiales, v: VagonAcotado, g: THREE.Group, eq: THREE.Group) {
  const L = v.entreCabezales, A = v.ancho
  const yPiso = DECK + H_BASTIDOR / 2
  const hCaja = Math.max(600, v.alto - yPiso)
  const yC = yPiso + hCaja / 2
  const esp = 70
  const oCaja = (n: string, e?: string): PiezaVagon => ({ nombre: n, categoria: 'CAJA', espec: e })
  const oEq = (n: string, e?: string): PiezaVagon => ({ nombre: n, categoria: 'EQUIPAMIENTO', espec: e })

  const laterales = (altura: number, yc: number, mat: THREE.Material, nombre: string) => {
    const dens = 0.55   // corrugas por cada 100 mm
    for (const sx of [-1, 1]) {
      g.add(caja(esp, altura, L - 200, sx * (A / 2), yc, 0, mat, {
        ...oCaja(nombre, `Ancho de caja ${A} mm`), uv: [(L - 200) * S * dens, 1],
      }))
    }
    for (const sz of [-1, 1]) {
      g.add(caja(A, altura, esp, 0, yc, sz * (L / 2 - 100), mat, {
        ...oCaja('Frente', `Entre cabezales ${L} mm`), uv: [A * S * dens, 1],
      }))
    }
    /* montantes verticales del cajón */
    const nM = Math.max(6, Math.round(L / 1500))
    for (let i = 0; i <= nM; i++) {
      const z = -L / 2 + 120 + ((L - 240) / nM) * i
      for (const sx of [-1, 1]) {
        g.add(caja(90, altura, 130, sx * (A / 2 + 25), yc, z, M.acero, oCaja('Montante de caja')))
      }
    }
    /* cordón superior y baranda perimetral */
    for (const sx of [-1, 1]) {
      g.add(caja(150, 90, L - 160, sx * (A / 2 - 20), yc + altura / 2 + 30, 0, M.acero, oCaja('Cordón superior')))
      eq.add(caja(50, 50, L - 300, sx * (A / 2 - 30), yc + altura / 2 + 560, 0, M.aceroClaro, oEq('Baranda de pasarela')))
      for (let i = 0; i < 7; i++) {
        eq.add(caja(45, 500, 45, sx * (A / 2 - 30), yc + altura / 2 + 310, -L / 2 + 400 + ((L - 800) / 6) * i, M.aceroClaro,
          oEq('Parante de baranda')))
      }
    }
  }

  /* Escalera de acceso en un extremo, común a todos los tipos */
  const escalera = (yTop: number) => {
    for (let i = 0; i < 6; i++) {
      eq.add(caja(360, 40, 60, -(A / 2 + 70), DECK - 250 + i * ((yTop - DECK + 250) / 6), L / 2 - 700, M.aceroClaro,
        oEq('Escalón de acceso')))
    }
    for (const dx of [-160, 160]) {
      eq.add(caja(50, yTop - DECK + 300, 50, -(A / 2 + 70) + dx * 0.55, (DECK - 250 + yTop) / 2, L / 2 - 700, M.aceroClaro,
        oEq('Larguero de escalera')))
    }
  }

  switch (v.tipo as TipoCaja) {
    case 'tanque': {
      const r = Math.min(A / 2, (v.alto - yPiso) / 2 + 200)
      g.add(cilindro(r, L - 900, 0, yPiso + r, 0, M.chapaLisa, {
        ...oCaja('Depósito cisterna', `Volumen útil ${v.volumen ?? '—'}`), rot: [Math.PI / 2, 0, 0],
      }))
      for (const sz of [-1, 1]) {
        g.add(cilindro(r, 160, 0, yPiso + r, sz * (L - 900) / 2, M.acero, {
          ...oCaja('Fondo del depósito'), rot: [Math.PI / 2, 0, 0],
        }))
      }
      /* domo, pasarela y escalera del vagón tanque */
      g.add(cyl2(300, 260, M.acero, 0, yPiso + 2 * r - 40, 0, oCaja('Domo de carga', 'Carga superior de depósito cisterna')))
      g.add(cyl2(330, 40, M.aceroClaro, 0, yPiso + 2 * r + 100, 0, oCaja('Tapa de domo')))
      eq.add(caja(700, 50, 2400, 0, yPiso + 2 * r + 40, 0, M.piso, oEq('Pasarela superior')))
      for (const sx of [-1, 1]) {
        eq.add(caja(45, 45, 2400, sx * 330, yPiso + 2 * r + 560, 0, M.aceroClaro, oEq('Baranda de pasarela')))
        for (let i = 0; i < 4; i++) {
          eq.add(caja(40, 520, 40, sx * 330, yPiso + 2 * r + 300, -1000 + i * 660, M.aceroClaro, oEq('Parante de baranda')))
        }
      }
      /* aros de refuerzo del depósito */
      for (let i = 0; i < 5; i++) {
        g.add(cyl2(r + 22, 60, M.acero, 0, yPiso + r, -L / 2 + 900 + ((L - 1800) / 4) * i, oCaja('Aro de refuerzo'), [Math.PI / 2, 0, 0]))
      }
      escalera(yPiso + 2 * r)
      break
    }
    case 'plataforma': {
      g.add(caja(A, 90, L, 0, yPiso, 0, M.piso, oCaja('Plataforma', `Altura de plataforma ${DECK} mm`)))
      /* topes de contenedor: un ISO 40′ o dos ISO 20′ */
      for (const z of [-L / 2 + 400, -60, 60, L / 2 - 400]) {
        eq.add(caja(A - 200, 120, 90, 0, yPiso + 100, z, M.acero, oEq('Tope de contenedor', 'Apto para un ISO 40′ o dos ISO 20′')))
      }
      /* nervios de la plataforma */
      for (let i = 0; i < 14; i++) {
        g.add(caja(A - 60, 70, 90, 0, yPiso - 70, -L / 2 + 300 + ((L - 600) / 13) * i, M.acero, oCaja('Nervio de plataforma')))
      }
      break
    }
    case 'tolva': case 'granero': {
      laterales(hCaja, yC, M.chapaOndulada, 'Lateral de caja')
      /* taludes internos hacia las bocas de descarga */
      const ang = 0.62
      for (const sx of [-1, 1]) {
        g.add(caja((A / 2) / Math.cos(ang), 50, L - 400, sx * A / 4, yPiso + 420, 0, M.chapaInterior, {
          ...oCaja('Talud de tolva', 'Taludes que conducen el material a la zona de descarga'),
          rot: [0, 0, sx > 0 ? ang : -ang],
        }))
      }
      const nb = v.tipo === 'granero' ? 4 : 6
      for (let i = 0; i < nb; i++) {
        const z = -L / 2 + (L / nb) * (i + 0.5)
        eq.add(caja(760, 320, 620, 0, DECK - 120, z, M.acero,
          oEq('Compuerta de descarga', v.tipo === 'granero'
            ? 'Cuatro compuertas centrales y cuatro boquillas laterales'
            : 'Apertura de seis compuertas laterales mediante sistema telescópico')))
        /* volante de accionamiento */
        eq.add(cyl2(150, 40, M.acero, -(A / 2 + 90), DECK + 260, z, oEq('Volante de accionamiento'), [0, Math.PI / 2, 0]))
      }
      escalera(yPiso + hCaja)
      break
    }
    case 'gondola': {
      laterales(hCaja, yC, M.chapaOndulada, 'Lateral de caja')
      /* piso inclinado a dos aguas */
      for (const sx of [-1, 1]) {
        g.add(caja((A / 2) / Math.cos(0.14), 50, L - 300, sx * A / 4, yPiso + 180, 0, M.chapaInterior, {
          ...oCaja('Piso inclinado a dos aguas', 'Permite el desagote por simple gravedad'),
          rot: [0, 0, sx > 0 ? -0.14 : 0.14],
        }))
      }
      for (let i = 0; i < 6; i++) {
        for (const sx of [-1, 1]) {
          eq.add(cyl2(55, 130, M.acero, sx * (A / 2 + 40), yPiso + 130, -L / 2 + (L / 6) * (i + 0.5),
            oEq('Drenaje lateral', 'Evacuación de agua y aireación del material caliente'), [0, 0, Math.PI / 2]))
        }
      }
      escalera(yPiso + hCaja)
      break
    }
    case 'borde': {
      laterales(hCaja, yC, M.chapaOndulada, 'Lateral de borde alto')
      for (let i = 0; i < 4; i++) {
        eq.add(caja(820, 300, 560, 0, DECK - 110, -L / 2 + (L / 4) * (i + 0.5), M.acero,
          oEq('Unidad de descarga de balasto', 'Accionamiento manual con sistema de traba')))
        eq.add(caja(120, 420, 90, -(A / 2 + 60), DECK + 140, -L / 2 + (L / 4) * (i + 0.5), M.aceroClaro,
          oEq('Palanca de accionamiento', 'Accionamiento manual con sistema de traba')))
      }
      escalera(yPiso + hCaja)
      break
    }
    default: { /* cerrado */
      laterales(hCaja, yC, M.chapaOndulada, 'Lateral de caja')
      g.add(caja(A, 60, L - 200, 0, yPiso + hCaja, 0, M.cubierta, oCaja('Techo')))
      /* cuatro puertas corredizas */
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        eq.add(caja(70, hCaja - 300, L / 4.6, sx * (A / 2 + 45), yC, sz * L / 4.4, M.chapaLisa,
          oEq('Puerta de gran apertura', 'Apertura máxima 6000 mm hacia un extremo · 5910 mm simétrica')))
        /* guías y manijas de la puerta */
        eq.add(caja(90, 70, L / 4.6, sx * (A / 2 + 45), yC + hCaja / 2 - 190, sz * L / 4.4, M.acero, oEq('Guía superior de puerta')))
        eq.add(caja(60, 200, 60, sx * (A / 2 + 90), yC, sz * (L / 4.4) - sx * L / 11, M.aceroClaro, oEq('Manija de puerta')))
      }
      escalera(yPiso + hCaja)
      break
    }
  }
}

export function construirVagon(v: VagonAcotado, materiales?: Materiales): ModeloVagon {
  const M = materiales ?? crearMateriales()
  const root = new THREE.Group()
  const grupos = {} as Record<CatVagon, THREE.Group>
  for (const c of CATS_VAGON) {
    const g = new THREE.Group(); g.name = c.id; g.visible = c.on
    grupos[c.id] = g; root.add(g)
  }

  const L = v.entreCabezales, A = v.ancho

  /* Bogies 1676 documentados, a la separación declarada */
  for (const sz of [-1, 1]) {
    const b = construirBogie(M)
    b.root.position.z = (sz * v.entreBogies / 2) * S
    b.root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.userData = {
          ...o.userData, categoria: 'BOGIES',
          nombre: `Bogie ${v.trocha} — ${o.userData.nombre ?? 'pieza'}`,
        }
      }
    })
    grupos.BOGIES.add(b.root)
  }

  /* Bastidor */
  for (const sx of [-1, 1]) {
    grupos.BASTIDOR.add(caja(180, H_BASTIDOR, L, sx * (A / 2 - 140), DECK, 0, M.acero, {
      nombre: 'Larguero de bastidor', categoria: 'BASTIDOR',
      espec: `Entre cabezales ${L} mm`,
    }))
  }
  grupos.BASTIDOR.add(caja(A - 300, 150, L, 0, DECK - 60, 0, M.acero, {
    nombre: 'Viga central', categoria: 'BASTIDOR',
  }))
  for (const sz of [-1, 1]) {
    grupos.BASTIDOR.add(caja(A, 260, 200, 0, DECK, sz * (L / 2 - 100), M.acero, {
      nombre: 'Cabezal', categoria: 'BASTIDOR', espec: `Entre cabezales ${L} mm`,
    }))
    /* enganche */
    grupos.EQUIPAMIENTO.add(caja(340, 260, 620, 0, DECK - 40, sz * (L / 2 + 260), M.aceroClaro, {
      nombre: 'Enganche automático', categoria: 'EQUIPAMIENTO', espec: 'Boquilla y cabeza de enganche tipo E',
    }))
  }
  /* apoyos sobre los bogies */
  for (const sz of [-1, 1]) {
    grupos.BASTIDOR.add(caja(A - 500, 120, 520, 0, DECK - 150, sz * v.entreBogies / 2, M.acero, {
      nombre: 'Travesaño de apoyo', categoria: 'BASTIDOR',
      espec: `Entre centro de bogies ${v.entreBogies} mm`,
    }))
  }

  construirCaja(M, v, grupos.CAJA, grupos.EQUIPAMIENTO)

  /* Explosión */
  const DIR: Record<CatVagon, [number, number, number]> = {
    CAJA: [0, 1, 0], EQUIPAMIENTO: [0, 0.4, 0], BASTIDOR: [0, -0.15, 0], BOGIES: [0, -1, 0],
  }
  const MAG: Record<CatVagon, number> = { CAJA: 3.4, EQUIPAMIENTO: 2.2, BASTIDOR: 1.0, BOGIES: 1.6 }
  for (const c of CATS_VAGON) {
    grupos[c.id].traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.userData.base = o.position.clone()
      o.userData.explode = new THREE.Vector3(...DIR[c.id]).normalize().multiplyScalar(MAG[c.id])
      o.userData.categoria = c.id
    })
  }

  return {
    root, grupos, materiales: M,
    radio: Math.hypot(A / 2, L / 2, v.alto) * S,
    dispose() {
      root.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() })
      if (!materiales) M.dispose()
    },
  }
}

export const DECK_VAGON = DECK
