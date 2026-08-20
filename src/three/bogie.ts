import * as THREE from 'three'
import { crearMateriales, type Materiales } from './materials'

/* ═══════════════════════════════════════════════════════════════
   BOGIE DE CHAPA SOLDADA S.A.B.B. — TROCHA 1676
   Geometría derivada de la ficha gráfica S.A.B.B. y de la
   especificación ET-BOGIE-1676. Unidades internas: milímetros.
   Origen: X=0 eje de vía · Z=0 centro del bogie · Y=0 nivel de riel
   ═══════════════════════════════════════════════════════════════ */

export type CatBogie = 'RODADURA' | 'ESTRUCTURA' | 'SUSPENSION' | 'FRENO' | 'INTERFAZ'

export const CATS_BOGIE: { id: CatBogie; label: string; on: boolean }[] = [
  { id: 'RODADURA', label: 'PAR MONTADO', on: true },
  { id: 'ESTRUCTURA', label: 'ESTRUCTURA', on: true },
  { id: 'SUSPENSION', label: 'SUSPENSIÓN', on: true },
  { id: 'FRENO', label: 'FRENO', on: true },
  { id: 'INTERFAZ', label: 'INTERFAZ', on: true },
]

/* ── Cotas (mm) ─────────────────────────────────────────────────── */
const TROCHA = 1676        // [cota] entre círculos de rodadura
const EJES = 1829          // [cota] distancia entre ejes
const D_RUEDA = 953        // [cota] diámetro de rueda
const ANCHO_CAJAS = 2628   // [cota] ancho sobre cajas de grasa
const ANCHO_TOTAL = 2839   // [cota] ancho total
const LARGO = 2210         // [cota] largo total
const H_PLACA = 750        // [cota] altura de placa central

const R_RUEDA = D_RUEDA / 2          // 476,5 — eje de rodadura
const X_RUEDA = TROCHA / 2           // 838
const X_LARGUERO = ANCHO_CAJAS / 2 - 164   // 1150 — eje del larguero sobre la caja
const Z_EJE = EJES / 2               // 914,5

/* Resortes: 5 exteriores Ø140 + 3 interiores Ø86 por nido [ET-BOGIE-1676] */
const RES_EXT_D = 140, RES_EXT_ALAMBRE = 27
const RES_INT_D = 86, RES_INT_ALAMBRE = 17
const H_NIDO = 260         // [medido] altura libre del nido

export interface PiezaBogie {
  nombre: string
  categoria: CatBogie
  cantidad?: string
  espec?: string
  origen: 'cota' | 'medido' | 'ficha'
}

export interface ModeloBogie {
  root: THREE.Group
  grupos: Record<CatBogie, THREE.Group>
  materiales: Materiales
  radio: number
  dispose(): void
}

const S = 0.001

function caja(
  w: number, h: number, d: number, cx: number, cy: number, cz: number,
  mat: THREE.Material, o: PiezaBogie & { rot?: [number, number, number] },
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat)
  m.position.set(cx * S, cy * S, cz * S)
  if (o.rot) m.rotation.set(...o.rot)
  m.castShadow = m.receiveShadow = true
  const { rot: _r, ...p } = o
  m.userData = { ...p }
  return m
}

function cilindro(
  rTop: number, rBot: number, h: number, cx: number, cy: number, cz: number,
  mat: THREE.Material, o: PiezaBogie & { rot?: [number, number, number]; seg?: number },
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop * S, rBot * S, h * S, o.seg ?? 28), mat)
  m.position.set(cx * S, cy * S, cz * S)
  if (o.rot) m.rotation.set(...o.rot)
  m.castShadow = m.receiveShadow = true
  const { rot: _r, seg: _s, ...p } = o
  m.userData = { ...p }
  return m
}

/* ── Resorte helicoidal ─────────────────────────────────────────── */
class Helice extends THREE.Curve<THREE.Vector3> {
  constructor(private radio: number, private alto: number, private vueltas: number) { super() }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = 2 * Math.PI * this.vueltas * t
    return target.set(
      Math.cos(a) * this.radio,
      this.alto * (t - 0.5),
      Math.sin(a) * this.radio,
    )
  }
}

function resorte(
  dExt: number, dAlambre: number, alto: number, vueltas: number,
  cx: number, cy: number, cz: number, mat: THREE.Material, o: PiezaBogie,
) {
  const r = (dExt - dAlambre) / 2 * S
  const g = new THREE.TubeGeometry(
    new Helice(r, alto * S, vueltas), Math.round(vueltas * 14), (dAlambre / 2) * S, 8, false,
  )
  const m = new THREE.Mesh(g, mat)
  m.position.set(cx * S, cy * S, cz * S)
  m.castShadow = true
  m.userData = { ...o }
  return m
}

/* ── Par montado: eje + dos ruedas + manguitos ──────────────────── */
function parMontado(M: Materiales, z: number) {
  const g = new THREE.Group()
  const o = (nombre: string, espec: string): PiezaBogie => ({
    nombre, categoria: 'RODADURA', espec, origen: 'ficha',
  })

  /* Eje FA 8006 FAT V700 — 5½" × 10" según NEFA 915-6 */
  g.add(cilindro(85, 85, ANCHO_CAJAS - 260, 0, R_RUEDA, z, M.acero, {
    ...o('Eje montado', 'FA 8006 FAT V700 — 5½" × 10" · plano NEFA 915-6'),
    rot: [0, 0, Math.PI / 2], seg: 24,
  }))

  for (const s of [-1, 1]) {
    /* Rueda FA 8005 FAT V701 — R8" · Ø 953 mm [cota] */
    g.add(cilindro(R_RUEDA, R_RUEDA, 135, s * X_RUEDA, R_RUEDA, z, M.aceroClaro, {
      ...o('Rueda', 'FA 8005 FAT V701 — R8" · Ø 953 mm · plano NEFA 1241-3 ó 156-8'),
      rot: [0, 0, Math.PI / 2], seg: 44,
    }))
    /* pestaña */
    g.add(cilindro(R_RUEDA + 28, R_RUEDA + 28, 26, s * (X_RUEDA + 80), R_RUEDA, z, M.aceroClaro, {
      ...o('Pestaña de rueda', 'Perfil de rodadura R8"'), rot: [0, 0, Math.PI / 2], seg: 44,
    }))
    /* Manguito a rodamiento FAT.MR.1303 5½" × 10" */
    g.add(cilindro(105, 105, 250, s * (X_RUEDA + 320), R_RUEDA, z, M.acero, {
      ...o('Manguito para rodamiento', 'FAT.MR.1303 de 5½" × 10" (SKF-FAG-NTN-TOYO)'),
      rot: [0, 0, Math.PI / 2], seg: 22,
    }))
    /* Adaptador FAT V707 — pedestal estrecho 5½" × 10" */
    g.add(caja(300, 130, 270, s * X_LARGUERO, R_RUEDA + 150, z, M.acero,
      o('Adaptador para manguito', 'FAT V707 de 5½" × 10" — pedestal estrecho')))
  }
  return g
}

/* ── Larguero (side frame) con pedestales y ventanas ────────────── */
function larguero(M: Materiales, sx: number) {
  const g = new THREE.Group()
  const o = (nombre: string, espec: string): PiezaBogie => ({
    nombre, categoria: 'ESTRUCTURA', espec, origen: 'ficha',
  })
  const x = sx * X_LARGUERO
  const yCord = R_RUEDA + 330      // cordón superior
  const esp = 150

  /* cordón superior e inferior */
  g.add(caja(esp, 90, LARGO, x, yCord, 0, M.chapaLisa,
    o('Larguero — cordón superior', 'Chapa laminada soldada según AAR')))
  g.add(caja(esp, 80, LARGO - 560, x, R_RUEDA - 30, 0, M.chapaLisa,
    o('Larguero — cordón inferior', 'Chapa laminada soldada según AAR')))
  /* almas verticales entre ventanas */
  for (const z of [-LARGO / 2 + 75, -430, 0, 430, LARGO / 2 - 75]) {
    g.add(caja(esp, 380, 110, x, R_RUEDA + 150, z, M.chapaLisa,
      o('Larguero — alma', 'Chapa laminada soldada según AAR')))
  }
  /* pedestales sobre las cajas de grasa */
  for (const s of [-1, 1]) {
    g.add(caja(esp + 40, 210, 330, x, R_RUEDA + 235, s * Z_EJE, M.acero,
      o('Pedestal de larguero', 'Alojamiento del adaptador 5½" × 10"')))
  }
  /* asiento del nido de resortes */
  g.add(caja(esp + 210, 60, 600, x, R_RUEDA - 60, 0, M.acero,
    o('Asiento de nido de resortes', 'Apoyo inferior de la suspensión')))
  return g
}

/* ── Traviesa (bolster) + interfaz con el vagón ─────────────────── */
function traviesa(M: Materiales) {
  const g = new THREE.Group()
  const o = (nombre: string, espec: string, cat: CatBogie = 'ESTRUCTURA'): PiezaBogie => ({
    nombre, categoria: cat, espec, origen: 'ficha',
  })
  const yT = H_PLACA - 190

  g.add(caja(2 * X_LARGUERO + 120, 250, 420, 0, yT, 0, M.chapaLisa,
    o('Traviesa', 'Chapa laminada soldada (largueros y traviesas) según AAR')))
  g.add(caja(2 * X_LARGUERO - 360, 90, 300, 0, yT + 165, 0, M.chapaLisa,
    o('Traviesa — cordón superior', 'Chapa laminada soldada según AAR')))

  /* Placa central superior — acero fundido según AAR · 750 mm [cota] */
  g.add(cilindro(200, 215, 90, 0, H_PLACA - 45, 0, M.acero, {
    ...o('Placa central superior', 'Acero fundido según normas AAR — altura 750 mm', 'INTERFAZ'), seg: 34,
  }))
  g.add(cilindro(175, 175, 26, 0, H_PLACA + 12, 0, M.aceroClaro, {
    ...o('Disco centro de bogie', 'Disco separador — 1 unidad', 'INTERFAZ'), seg: 34,
  }))

  /* Placas laterales constant contact */
  for (const s of [-1, 1]) {
    g.add(caja(230, 120, 190, s * 686, H_PLACA - 100, 0, M.acero,
      o('Placa lateral (constant contact)', 'Side bearing de contacto permanente — separación 686 mm', 'INTERFAZ')))
  }
  return g
}

/* ── Nido de suspensión: 5 exteriores + 3 interiores + cuñas ────── */
function nido(M: Materiales, sx: number) {
  const g = new THREE.Group()
  const x = sx * X_LARGUERO
  const yBase = R_RUEDA - 30
  /* 5 exteriores en cruz sobre el asiento */
  const pos: [number, number][] = [[0, 0], [-190, 0], [190, 0], [0, -190], [0, 190]]
  pos.forEach(([dx, dz], i) => {
    g.add(resorte(RES_EXT_D, RES_EXT_ALAMBRE, H_NIDO, 6, x + dx, yBase + H_NIDO / 2, dz, M.acero, {
      nombre: 'Resorte exterior', categoria: 'SUSPENSION', cantidad: '10 (5 por nido)',
      espec: `Ø alambre ${RES_EXT_ALAMBRE} mm · Ø exterior ${RES_EXT_D} mm`, origen: 'ficha',
    }))
    /* 3 interiores dentro de tres de los exteriores */
    if (i < 3) {
      g.add(resorte(RES_INT_D, RES_INT_ALAMBRE, H_NIDO - 20, 7, x + dx, yBase + H_NIDO / 2, dz, M.aceroClaro, {
        nombre: 'Resorte interior', categoria: 'SUSPENSION', cantidad: '6 (3 por nido)',
        espec: `Ø alambre ${RES_INT_ALAMBRE} mm · Ø exterior ${RES_INT_D} mm — ver discrepancia de fuentes`,
        origen: 'ficha',
      }))
    }
  })
  /* Cuñas a fricción — control de marcha (2 por nido) */
  for (const sz of [-1, 1]) {
    g.add(caja(180, 230, 150, x - sx * 60, yBase + H_NIDO - 40, sz * 250, M.aceroClaro, {
      nombre: 'Cuña a fricción', categoria: 'SUSPENSION', cantidad: '4 (2 por nido)',
      espec: 'Control de marcha — tipo fricción estándar', origen: 'ficha',
      rot: [0, 0, sx * 0.16],
    }))
  }
  return g
}

/* ── Freno: travesaños UNIT + zapatas + barra de empuje ─────────── */
function freno(M: Materiales) {
  const g = new THREE.Group()
  for (const sz of [-1, 1]) {
    const z = sz * (Z_EJE - 300)
    g.add(caja(ANCHO_TOTAL - 300, 110, 120, 0, R_RUEDA - 120, z, M.acero, {
      nombre: 'Travesaño de freno', categoria: 'FRENO', cantidad: '2',
      espec: 'Tipo UNIT — perfiles laminados y soldados · dimensiones s/ NEFA 576/2', origen: 'ficha',
    }))
    for (const sx of [-1, 1]) {
      g.add(caja(150, 320, 70, sx * X_RUEDA, R_RUEDA + 40, sz * (Z_EJE - 490), M.chapaInterior, {
        nombre: 'Zapata de freno', categoria: 'FRENO', cantidad: '4 (1 por rueda)',
        espec: 'Freno mecánico a zapatas — 1 para cada rueda', origen: 'ficha',
        rot: [sz * 0.32, 0, 0],
      }))
    }
  }
  /* Barra de empuje — tubo ASTM A53 SCH 80 */
  g.add(cilindro(48, 48, EJES - 640, 0, R_RUEDA - 250, 0, M.acero, {
    nombre: 'Barra de empuje', categoria: 'FRENO', cantidad: '1',
    espec: 'Cuerpo tubular ASTM A53 SCH 80 · horquilla de acero fundido', origen: 'ficha',
    rot: [Math.PI / 2, 0, 0], seg: 18,
  }))
  /* Eslabón de ajuste — palancas vivas y muertas */
  for (const sx of [-1, 1]) {
    g.add(caja(60, 420, 30, sx * 430, R_RUEDA - 120, Z_EJE - 300, M.chapaLisa, {
      nombre: 'Eslabón de ajuste', categoria: 'FRENO', cantidad: '1 juego',
      espec: 'Chapa laminada — palancas vivas y muertas · bujes cementados y templados', origen: 'ficha',
    }))
  }
  return g
}

/* ═══════════════════════════════════════════════════════════════ */
export function construirBogie(materiales?: Materiales): ModeloBogie {
  const M = materiales ?? crearMateriales()
  const root = new THREE.Group()
  const grupos = {} as Record<CatBogie, THREE.Group>
  for (const c of CATS_BOGIE) {
    const g = new THREE.Group(); g.name = c.id; g.visible = c.on
    grupos[c.id] = g; root.add(g)
  }

  grupos.RODADURA.add(parMontado(M, -Z_EJE), parMontado(M, Z_EJE))
  grupos.ESTRUCTURA.add(larguero(M, -1), larguero(M, 1), traviesa(M))
  grupos.SUSPENSION.add(nido(M, -1), nido(M, 1))
  grupos.FRENO.add(freno(M))
  /* La traviesa aporta también las piezas de interfaz. Se recolectan primero y
     se reubican después: mover un objeto durante el recorrido muta el arreglo
     de hijos que se está iterando. */
  const aInterfaz: THREE.Object3D[] = []
  grupos.ESTRUCTURA.traverse((o) => {
    if (o instanceof THREE.Mesh && o.userData.categoria === 'INTERFAZ') aInterfaz.push(o)
  })
  aInterfaz.forEach((o) => grupos.INTERFAZ.attach(o))

  /* Explosión técnica: cada categoría se separa en su eje natural */
  const DIR: Record<CatBogie, [number, number, number]> = {
    INTERFAZ: [0, 1, 0], ESTRUCTURA: [0, 0.35, 0], SUSPENSION: [0, 0.8, 0],
    FRENO: [0, -0.7, 0], RODADURA: [0, -0.45, 0],
  }
  const MAG: Record<CatBogie, number> = {
    INTERFAZ: 1.5, ESTRUCTURA: 0.75, SUSPENSION: 1.15, FRENO: 0.85, RODADURA: 0.4,
  }
  for (const c of CATS_BOGIE) {
    grupos[c.id].traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const cat = (o.userData.categoria ?? c.id) as CatBogie
      const d = new THREE.Vector3(...DIR[cat])
      if (cat === 'ESTRUCTURA') {
        const p = new THREE.Vector3(); o.getWorldPosition(p)
        d.x = Math.sign(p.x) * 0.55
      }
      o.userData.base = o.position.clone()
      o.userData.explode = d.normalize().multiplyScalar(MAG[cat])
      o.userData.categoria = cat
    })
  }

  root.position.y = 0
  return {
    root, grupos, materiales: M,
    radio: Math.hypot(ANCHO_TOTAL / 2, LARGO / 2, H_PLACA) * S,
    dispose() {
      root.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() })
      if (!materiales) M.dispose()
    },
  }
}

export const DIMS_BOGIE = { TROCHA, EJES, D_RUEDA, ANCHO_CAJAS, ANCHO_TOTAL, LARGO, H_PLACA, R_RUEDA }
