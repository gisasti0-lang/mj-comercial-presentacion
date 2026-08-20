import * as THREE from 'three'
import { crearMateriales, type Materiales } from './materials'
import { MEDIDO } from '../data/project'

/* ═══════════════════════════════════════════════════════════════
   MODELO PARAMÉTRICO — ALCALDÍA PENITENCIARIA
   Toda la geometría deriva de las cotas del plano MJ COMERCIAL.
   Unidades internas: milímetros → se escalan a metros al final.
   Origen: X=0 cara exterior izquierda · Z=0 extremo celaduría · Y=0 piso terminado
   ═══════════════════════════════════════════════════════════════ */

export type Categoria =
  | 'FUNDACIONES' | 'ESTRUCTURA' | 'PISOS' | 'MUROS'
  | 'TECHOS' | 'CARPINTERIAS' | 'INTERIORES' | 'INSTALACIONES'

export const CATEGORIAS: { id: Categoria; label: string; on: boolean }[] = [
  { id: 'ESTRUCTURA', label: 'ESTRUCTURA', on: true },
  { id: 'MUROS', label: 'MUROS', on: true },
  { id: 'TECHOS', label: 'TECHOS', on: true },
  { id: 'PISOS', label: 'PISOS', on: true },
  { id: 'CARPINTERIAS', label: 'CARPINTERÍAS', on: true },
  { id: 'INTERIORES', label: 'INTERIORES', on: true },
  { id: 'FUNDACIONES', label: 'APOYOS', on: true },
  { id: 'INSTALACIONES', label: 'INSTALACIONES', on: false },
]

/* ── Cotas (mm) ─────────────────────────────────────────────────── */
const W = 9000                 // ancho total                        [cota]
const CEL = 3000               // fondo módulo celaduría             [cota]
const TRAMO = 12000            // largo módulo de celdas             [cota]
const BAND = 3000              // ancho de cada banda (celdas/patio) [cota]
const T = MEDIDO.espesorMuro   // 120                                [medido]

const N = {
  base: -311, fondo: -126, piso: 0, cielo: 2400,
  techoMod: 2586, fajaInf: 2760, fajaSup: 3262, alero: 3340, cumbrera: 3459,
}
const PEND = 0.035             // pendiente de cubierta [proporción medida s/ corte B-B]
const VUELO = 150              // alero módulos
const VUELO_SUP = 300          // alero techo superior

export interface Pieza {
  nombre: string
  categoria: Categoria
  modulo?: string
  ficha?: string
  detalle?: string
  cota?: string
  origen?: 'cota' | 'medido' | 'memoria'
}

export interface Modelo {
  root: THREE.Group
  grupos: Record<Categoria, THREE.Group>
  seleccionables: THREE.Mesh[]
  largo: number
  tramos: number
  materiales: Materiales
  dispose(): void
}

/* ── Utilidades ─────────────────────────────────────────────────── */
const S = 0.001 // mm → m

function scaleUV(g: THREE.BufferGeometry, su: number, sv: number) {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
  uv.needsUpdate = true
  return g
}

interface CajaOpts extends Pieza {
  uv?: [number, number]
  rot?: [number, number, number]
}

function caja(
  w: number, h: number, d: number,
  cx: number, cy: number, cz: number,
  mat: THREE.Material, o: CajaOpts,
): THREE.Mesh {
  const g = new THREE.BoxGeometry(w * S, h * S, d * S)
  if (o.uv) scaleUV(g, o.uv[0], o.uv[1])
  const m = new THREE.Mesh(g, mat)
  m.position.set(cx * S, cy * S, cz * S)
  if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2])
  m.castShadow = true
  m.receiveShadow = true
  const { uv: _uv, rot: _rot, ...pieza } = o
  m.userData = { ...pieza }
  return m
}

/* ── Muro con huecos ────────────────────────────────────────────── */
export interface Hueco { u0: number; u1: number; v0: number; v1: number }

/**
 * Construye un muro descomponiéndolo en cajas alrededor de los huecos.
 * Eje local: u = largo (X), v = altura (Y), espesor en Z.
 */
function muro(
  largo: number, alto: number, esp: number, huecos: Hueco[],
  mat: THREE.Material, o: Pieza & { corrugado?: boolean },
): THREE.Group {
  const g = new THREE.Group()
  g.userData = { ...o }
  const cortes = new Set<number>([0, largo])
  huecos.forEach((h) => { cortes.add(Math.max(0, h.u0)); cortes.add(Math.min(largo, h.u1)) })
  const us = [...cortes].sort((a, b) => a - b)

  for (let i = 0; i < us.length - 1; i++) {
    const u0 = us[i], u1 = us[i + 1]
    if (u1 - u0 < 1) continue
    const dentro = huecos.filter((h) => h.u0 <= u0 + 0.5 && h.u1 >= u1 - 0.5)
                         .sort((a, b) => a.v0 - b.v0)
    const bandas: [number, number][] = []
    let v = 0
    for (const h of dentro) {
      if (h.v0 > v) bandas.push([v, h.v0])
      v = Math.max(v, h.v1)
    }
    if (v < alto) bandas.push([v, alto])

    for (const [v0, v1] of bandas) {
      if (v1 - v0 < 1) continue
      const w = u1 - u0, hgt = v1 - v0
      g.add(caja(w, hgt, esp, u0 + w / 2 - largo / 2, v0 + hgt / 2, 0, mat, {
        ...o,
        uv: o.corrugado ? [w * S * 0.5, 1] : undefined,
      }))
    }
  }
  return g
}

/* ── Reja: barrotes verticales + travesaños ─────────────────────── */
function reja(
  largo: number, alto: number, mat: THREE.Material, o: Pieza,
  paso = 110, travesanos = 6,
): THREE.Group {
  const g = new THREE.Group()
  g.userData = { ...o }
  const n = Math.max(2, Math.round(largo / paso))
  const bg = new THREE.BoxGeometry(0.022, alto * S, 0.022)
  const inst = new THREE.InstancedMesh(bg, mat, n + 1)
  inst.castShadow = true
  const m4 = new THREE.Matrix4()
  for (let i = 0; i <= n; i++) {
    m4.makeTranslation((-largo / 2 + (largo * i) / n) * S, (alto / 2) * S, 0)
    inst.setMatrixAt(i, m4)
  }
  inst.instanceMatrix.needsUpdate = true
  inst.userData = { ...o }
  g.add(inst)

  const tg = new THREE.BoxGeometry(largo * S, 0.035, 0.035)
  const ti = new THREE.InstancedMesh(tg, mat, travesanos)
  ti.castShadow = true
  for (let i = 0; i < travesanos; i++) {
    m4.makeTranslation(0, (alto * (i + 0.5)) / travesanos * S, 0)
    ti.setMatrixAt(i, m4)
  }
  ti.instanceMatrix.needsUpdate = true
  ti.userData = { ...o }
  g.add(ti)

  // marco
  const marco = new THREE.BoxGeometry(0.06, alto * S, 0.06)
  for (const sx of [-1, 1]) {
    const p = new THREE.Mesh(marco, mat)
    p.position.set((sx * largo / 2) * S, (alto / 2) * S, 0)
    p.castShadow = true
    p.userData = { ...o }
    g.add(p)
  }
  return g
}

/* ── Cucheta (cama doble nivel) + sanitario ─────────────────────── */
function cucheta(mats: Materiales, o: Pieza): THREE.Group {
  const g = new THREE.Group()
  g.userData = { ...o }
  const L = MEDIDO.celdas.camaLargo, A = MEDIDO.celdas.camaAncho
  const niveles = [420, 1420]
  for (const y of niveles) {
    g.add(caja(L, 60, A, 0, y, 0, mats.aceroClaro, { ...o, nombre: 'Bastidor de cucheta' }))
    g.add(caja(L - 80, 110, A - 60, 0, y + 85, 0, mats.colchon, { ...o, nombre: 'Colchón' }))
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(caja(50, 1900, 50, (sx * (L / 2 - 30)), 950, sz * (A / 2 - 30), mats.acero, { ...o, nombre: 'Parante de cucheta' }))
  }
  return g
}

function sanitario(mats: Materiales, o: Pieza): THREE.Group {
  const g = new THREE.Group()
  g.userData = { ...o }
  g.add(caja(380, 400, 300, 0, 200, 0, mats.sanitario, { ...o, nombre: 'Inodoro amurado' }))
  g.add(caja(400, 260, 140, 0, 560, -80, mats.sanitario, { ...o, nombre: 'Mochila' }))
  g.add(caja(420, 130, 320, 0, 900, 190, mats.sanitario, { ...o, nombre: 'Lavabo amurado' }))
  return g
}

/* ═══════════════════════════════════════════════════════════════
   CONSTRUCCIÓN
   ═══════════════════════════════════════════════════════════════ */
export function construir(tramos: number, materiales?: Materiales): Modelo {
  const M = materiales ?? crearMateriales()
  const L = CEL + TRAMO * tramos          // largo total
  const root = new THREE.Group()

  const grupos = {} as Record<Categoria, THREE.Group>
  for (const c of CATEGORIAS) {
    const g = new THREE.Group()
    g.name = c.id
    g.visible = c.on
    grupos[c.id] = g
    root.add(g)
  }
  const add = (cat: Categoria, o: THREE.Object3D) => grupos[cat].add(o)

  /* Bandas transversales: A = celdas izq, P = patio, B = celdas der */
  const bandas = [
    { id: 'celdas-a', x0: 0, x1: BAND },
    { id: 'patio', x0: BAND, x1: 2 * BAND },
    { id: 'celdas-b', x0: 2 * BAND, x1: 3 * BAND },
  ]

  /* ── 1. FUNDACIONES: apoyos de nivelación ─────────────────────── */
  const ejesX = [T / 2, BAND, 2 * BAND, W - T / 2]
  for (const x of ejesX) {
    for (let z = 600; z < L; z += 2400) {
      const o: Pieza = {
        nombre: 'Apoyo de nivelación', categoria: 'FUNDACIONES',
        cota: 'Altura de apoyos 311 mm (medido s/ plano)', origen: 'medido',
      }
      add('FUNDACIONES', caja(220, 130, 220, x, N.base + 65, z, M.acero, o))
      add('FUNDACIONES', caja(150, 60, 150, x, N.base + 160, z, M.aceroClaro, o))
    }
  }

  /* ── 2. PISOS ─────────────────────────────────────────────────── */
  const pisoO = (mod: string): Pieza => ({
    nombre: 'Paquete de piso', categoria: 'PISOS', modulo: mod,
    ficha: 'chapa-antideslizante', detalle: 'pisos', origen: 'cota',
    cota: 'Chapa antideslizante 3,2 mm · Aislante · Perfil C 100×50×2 · Chapa 2 mm',
  })
  add('PISOS', caja(W, 126, CEL, W / 2, N.fondo + 63, CEL / 2, M.piso, pisoO('celaduria')))
  for (const b of bandas) {
    add('PISOS', caja(BAND, 126, L - CEL, (b.x0 + b.x1) / 2, N.fondo + 63, CEL + (L - CEL) / 2, M.piso, pisoO(b.id)))
  }

  /* Perfil C 100×50×2 — estructura de piso (instanciada) */
  {
    const o: Pieza = {
      nombre: 'Perfil C 100 × 50 × 2 mm', categoria: 'ESTRUCTURA',
      ficha: 'perfil-c', detalle: 'pisos', origen: 'cota', cota: 'Estructura de piso',
    }
    const paso = 900
    const n = Math.floor(L / paso)
    const g = new THREE.BoxGeometry(W * S, 0.1, 0.05)
    const inst = new THREE.InstancedMesh(g, M.acero, n)
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < n; i++) {
      m4.makeTranslation((W / 2) * S, (N.fondo + 63) * S, (paso / 2 + i * paso) * S)
      inst.setMatrixAt(i, m4)
    }
    inst.instanceMatrix.needsUpdate = true
    inst.userData = { ...o }
    inst.castShadow = true
    add('ESTRUCTURA', inst)
  }

  /* ── 3. ESTRUCTURA: parantes ──────────────────────────────────── */
  {
    const oPri: Pieza = {
      nombre: 'PARANTE PRINCIPAL', categoria: 'ESTRUCTURA', ficha: 'parante-principal',
      detalle: 'muros', origen: 'cota', cota: 'Tubo 120 × 120 × 3,2 mm',
    }
    const oSec: Pieza = {
      nombre: 'PARANTE SECUNDARIO', categoria: 'ESTRUCTURA', ficha: 'parante-secundario',
      detalle: 'muros', origen: 'cota', cota: 'Tubo 120 × 60 × 2 mm',
    }
    const alt = N.cielo + 186
    const zsPri = [T / 2]
    for (let z = CEL; z <= L; z += TRAMO / 4) zsPri.push(Math.min(z, L - T / 2))
    for (const x of ejesX) for (const z of zsPri) {
      add('ESTRUCTURA', caja(120, alt, 120, x, alt / 2, z, M.acero, oPri))
    }
    // secundarios intermedios
    for (const x of ejesX) {
      for (let z = CEL + 1500; z < L; z += 1500) {
        if (Math.abs((z - CEL) % (TRAMO / 4)) < 1) continue
        add('ESTRUCTURA', caja(120, alt, 60, x, alt / 2, z, M.aceroClaro, oSec))
      }
    }
    // vigas de coronamiento
    for (const x of ejesX) {
      add('ESTRUCTURA', caja(120, 120, L, x, alt - 60, L / 2, M.acero, oPri))
    }
  }

  /* Tubo 50×50×2 — estructura de techo */
  {
    const o: Pieza = {
      nombre: 'Estructura de techo — Tubo 50 × 50 × 2 mm', categoria: 'ESTRUCTURA',
      ficha: 'tubo-techo', detalle: 'techo', origen: 'cota',
    }
    const paso = 1000
    const n = Math.floor((L - CEL) / paso)
    for (const b of [bandas[0], bandas[2]]) {
      const g = new THREE.BoxGeometry(BAND * S, 0.05, 0.05)
      const inst = new THREE.InstancedMesh(g, M.aceroClaro, n)
      const m4 = new THREE.Matrix4()
      for (let i = 0; i < n; i++) {
        const z = CEL + paso / 2 + i * paso
        const alto = N.techoMod - PEND * (b.id === 'celdas-a' ? BAND / 2 : BAND / 2) - 90
        m4.makeTranslation(((b.x0 + b.x1) / 2) * S, alto * S, z * S)
        inst.setMatrixAt(i, m4)
      }
      inst.instanceMatrix.needsUpdate = true
      inst.userData = { ...o }
      add('ESTRUCTURA', inst)
    }
  }

  /* ── 4. MUROS ─────────────────────────────────────────────────── */
  const oMuroExt = (mod: string): Pieza & { corrugado: boolean } => ({
    nombre: 'Muro exterior', categoria: 'MUROS', modulo: mod, corrugado: true,
    ficha: 'chapa-ondulada', detalle: 'muros', origen: 'cota',
    cota: 'Chapa ondulada pintada · Aislante · Chapa 3,2 mm',
  })
  const oMuroInt = (mod: string): Pieza => ({
    nombre: 'Tabique interior', categoria: 'MUROS', modulo: mod,
    ficha: 'chapa-32', detalle: 'muros', origen: 'medido',
    cota: 'Posición medida sobre plano',
  })

  const H = N.cielo + 186   // altura de muro hasta cara superior de techo

  /* 4.1 Celaduría — frente (z = 0) con INGRESO */
  {
    /* El vano se ubica frente al local CELADURÍA (1493–5129 s/ planta): es el
       local que el plano nombra como destino del ingreso. */
    const xIngreso = 3300
    const g = muro(W, H, T, [{ u0: xIngreso - 550, u1: xIngreso + 550, v0: 0, v1: 2100 }], M.chapaOndulada, oMuroExt('celaduria'))
    g.position.set((W / 2) * S, 0, (T / 2) * S)
    add('MUROS', g)
    const r = reja(1100, 2100, M.reja, {
      nombre: 'INGRESO CELADURÍA', categoria: 'CARPINTERIAS', modulo: 'celaduria',
      origen: 'cota', cota: 'Indicado en el plano (isométrico). Abre sobre el local CELADURÍA.',
    })
    r.position.set(xIngreso * S, 0, (T / 2) * S)
    add('CARPINTERIAS', r)
  }

  /* 4.2 Celaduría — laterales y tabiques internos */
  for (const x of [T / 2, W - T / 2]) {
    const g = muro(CEL, H, T, [], M.chapaOndulada, oMuroExt('celaduria'))
    g.rotation.y = Math.PI / 2
    g.position.set(x * S, 0, (CEL / 2) * S)
    add('MUROS', g)
  }
  for (const [x, nombre] of [[1440, 'Tabique baño celaduría'], [5190, 'Tabique duchas']] as [number, string][]) {
    const g = muro(CEL - T, N.cielo, T, [{ u0: 300, u1: 1100, v0: 0, v1: 2050 }], M.chapaInterior, { ...oMuroInt('celaduria'), nombre })
    g.rotation.y = Math.PI / 2
    g.position.set(x * S, 0, (CEL / 2) * S)
    add('MUROS', g)
  }

  /* 4.3 Muro celaduría / corredor (z = CEL) — puerta de seguridad */
  {
    const hue: Hueco[] = [{ u0: BAND + 900, u1: BAND + 2100, v0: 0, v1: 2200 }]
    const g = muro(W, H, T, hue, M.chapaOndulada, oMuroExt('celaduria'))
    g.position.set((W / 2) * S, 0, (CEL - T / 2) * S)
    add('MUROS', g)
    const r = reja(1200, 2200, M.reja, {
      nombre: 'PUERTA DE SEGURIDAD — extremo del corredor', categoria: 'CARPINTERIAS',
      modulo: 'patio', origen: 'memoria',
      cota: 'Puertas de seguridad en cada extremo del corredor (memoria descriptiva)',
    })
    r.position.set((BAND + 1500) * S, 0, (CEL - T / 2) * S)
    add('CARPINTERIAS', r)
  }

  /* 4.4 Módulos de celdas — muros exteriores (x = 0 y x = W) */
  const largoCeldas = L - CEL
  for (const [x, mod] of [[T / 2, 'celdas-a'], [W - T / 2, 'celdas-b']] as [number, string][]) {
    const huecos: Hueco[] = []
    // ACCESO PLOMERÍA: puerta doble a mitad de cada tramo
    for (let k = 0; k < tramos; k++) {
      const zc = MEDIDO.celdas.puertaZ + k * TRAMO
      huecos.push({ u0: zc - CEL - 700, u1: zc - CEL + 700, v0: 0, v1: 2150 })
    }
    // ventanas altas con reja, una por cucheta
    for (let k = 0; k < tramos; k++) {
      for (const cz of MEDIDO.celdas.camaZ) {
        const z = cz + k * TRAMO - CEL
        huecos.push({ u0: z - 300, u1: z + 300, v0: 1750, v1: 2150 })
      }
    }
    const g = muro(largoCeldas, H, T, huecos, M.chapaOndulada, oMuroExt(mod))
    g.rotation.y = Math.PI / 2
    g.position.set(x * S, 0, (CEL + largoCeldas / 2) * S)
    add('MUROS', g)

    // carpinterías en esos huecos
    for (let k = 0; k < tramos; k++) {
      const zc = MEDIDO.celdas.puertaZ + k * TRAMO
      const p = new THREE.Group()
      for (const s of [-1, 1]) {
        p.add(caja(660, 2150, 60, s * 350, 1075, 0, M.chapaLisa, {
          nombre: 'ACCESO PLOMERÍA', categoria: 'CARPINTERIAS', modulo: mod, origen: 'cota',
          cota: 'Puerta doble indicada en planta e isométrico, a mitad del módulo de celdas',
        }))
      }
      p.rotation.y = Math.PI / 2
      p.position.set(x * S, 0, zc * S)
      add('CARPINTERIAS', p)

      for (const cz of MEDIDO.celdas.camaZ) {
        const z = cz + k * TRAMO
        const r = reja(600, 400, M.reja, {
          nombre: 'Reja de ventana', categoria: 'CARPINTERIAS', modulo: mod, origen: 'medido',
          cota: 'Ventana alta con reja — indicada en elevación, sin cota',
        }, 90, 2)
        r.rotation.y = Math.PI / 2
        r.position.set(x * S, 1750 * S, z * S)
        add('CARPINTERIAS', r)
      }
    }
  }

  /* 4.5 Muros celdas / corredor (x = BAND y x = 2·BAND) con puertas de celda */
  for (const [x, mod] of [[BAND - T / 2, 'celdas-a'], [2 * BAND + T / 2, 'celdas-b']] as [number, string][]) {
    const huecos: Hueco[] = []
    const puertas: number[] = []
    for (let k = 0; k < tramos; k++) {
      /* En el tramo libre contiguo al tabique: es el único sector de la celda
         sin cuchetas, así el vano queda despejado. */
      for (const lado of [-1, 1]) {
        const zc = MEDIDO.celdas.tabiqueEnZ + k * TRAMO + lado * 1350
        puertas.push(zc)
        huecos.push({ u0: zc - CEL - 500, u1: zc - CEL + 500, v0: 0, v1: 2100 })
      }
    }
    const g = muro(largoCeldas, H, T, huecos, M.chapaInterior, { ...oMuroInt(mod), nombre: 'Muro celda / corredor' })
    g.rotation.y = Math.PI / 2
    g.position.set(x * S, 0, (CEL + largoCeldas / 2) * S)
    add('MUROS', g)
    for (const zc of puertas) {
      const r = reja(1000, 2100, M.reja, {
        nombre: 'Puerta de celda', categoria: 'CARPINTERIAS', modulo: mod, origen: 'memoria',
        cota: 'El corredor facilita el acceso a cada celda (memoria). Posición no acotada.',
      }, 95, 5)
      r.rotation.y = Math.PI / 2
      r.position.set(x * S, 0, zc * S)
      add('CARPINTERIAS', r)
    }
  }

  /* 4.6 Tabique intermedio de cada módulo de celdas */
  for (const b of [bandas[0], bandas[2]]) {
    for (let k = 0; k < tramos; k++) {
      const z = MEDIDO.celdas.tabiqueEnZ + k * TRAMO
      const g = muro(BAND - T, N.cielo, T, [], M.chapaInterior, {
        ...oMuroInt(b.id), nombre: 'Tabique entre celdas',
        cota: 'Divide el módulo en dos celdas (memoria). Posición a mitad del módulo, medida s/ plano.',
      })
      g.position.set(((b.x0 + b.x1) / 2) * S, 0, z * S)
      add('MUROS', g)
    }
  }

  /* 4.7 Muro de fondo (z = L) — celdas; el patio lleva el portón */
  for (const b of [bandas[0], bandas[2]]) {
    const g = muro(BAND, H, T, [], M.chapaOndulada, oMuroExt(b.id))
    g.position.set(((b.x0 + b.x1) / 2) * S, 0, (L - T / 2) * S)
    add('MUROS', g)
  }
  {
    const r = reja(BAND - 100, N.cielo, M.reja, {
      nombre: 'PORTÓN FINAL PATIO/CORREDOR', categoria: 'CARPINTERIAS', modulo: 'patio',
      origen: 'cota', cota: 'Indicado en el plano y en el isométrico',
    }, 100, 7)
    r.position.set((W / 2) * S, 0, (L - T / 2) * S)
    add('CARPINTERIAS', r)
  }

  /* ── 5. TECHOS ────────────────────────────────────────────────── */
  const ang = Math.atan(PEND)
  /* 5.1 Cubierta de módulos de celdas (faldón hacia afuera) */
  for (const b of [bandas[0], bandas[2]]) {
    const haciaIzq = b.id === 'celdas-a'
    const anchoF = BAND + VUELO
    const xc = haciaIzq ? (b.x1 - anchoF / 2 + 0) : (b.x0 + anchoF / 2)
    const yAlto = N.techoMod
    const yc = yAlto - (PEND * anchoF) / 2 + 30
    const m = caja(anchoF / Math.cos(ang), 60, largoCeldas + VUELO, xc, yc, CEL + (largoCeldas + VUELO) / 2,
      M.cubierta, {
        nombre: 'Cubierta módulo de celdas', categoria: 'TECHOS', modulo: b.id,
        ficha: 'chapa-galv', detalle: 'techo', origen: 'cota',
        cota: 'Chapa galvanizada T101 · Aislante · Chapa 3,2 mm · Costillas chapa 3,2 mm',
        uv: [anchoF * S * 0.35, 1],
        rot: [0, 0, haciaIzq ? ang : -ang],
      })
    add('TECHOS', m)
  }
  /* 5.2 Cubierta de celaduría (faldón hacia el frente) */
  {
    const fondo = CEL + VUELO
    const m = caja(W + 2 * VUELO, 60, fondo / Math.cos(ang), W / 2, N.techoMod - (PEND * fondo) / 2 + 30, (CEL - VUELO) / 2,
      M.cubierta, {
        nombre: 'Cubierta módulo celaduría', categoria: 'TECHOS', modulo: 'celaduria',
        ficha: 'chapa-galv', detalle: 'techo', origen: 'cota',
        cota: 'Chapa galvanizada T101 · Aislante · Chapa 3,2 mm',
        uv: [(W + 2 * VUELO) * S * 0.35, 1],
        rot: [-ang, 0, 0],
      })
    add('TECHOS', m)
  }
  /* 5.3 Techo superior sobre patio — dos aguas */
  {
    const semi = BAND / 2 + VUELO_SUP
    const angS = Math.atan((N.cumbrera - N.alero) / semi)
    const largoS = largoCeldas + 2 * VUELO_SUP
    for (const s of [-1, 1]) {
      add('TECHOS', caja(semi / Math.cos(angS), 55, largoS,
        W / 2 + (s * semi) / 2, (N.alero + N.cumbrera) / 2 + 27, CEL + largoCeldas / 2,
        M.cubierta, {
          nombre: 'Techo superior sobre patio/corredor', categoria: 'TECHOS', modulo: 'patio',
          ficha: 'chapa-galv', detalle: 'techo', origen: 'medido',
          cota: 'Cumbrera a 3770 mm de la base de apoyos (cota de plano)',
          uv: [semi * S * 0.35, 1],
          rot: [0, 0, s > 0 ? -angS : angS],
        }))
    }
    /* Faja de reja superior — 500 mm [cota] */
    const oFaja: Pieza = {
      nombre: 'Faja de reja superior', categoria: 'CARPINTERIAS', modulo: 'patio',
      origen: 'cota', cota: '500 mm — cota indicada en la elevación longitudinal',
    }
    for (const x of [BAND, 2 * BAND]) {
      const r = reja(largoCeldas, N.fajaSup - N.fajaInf, M.reja, oFaja, 120, 2)
      r.rotation.y = Math.PI / 2
      r.position.set(x * S, N.fajaInf * S, (CEL + largoCeldas / 2) * S)
      add('CARPINTERIAS', r)
    }
    for (const z of [CEL, L]) {
      const r = reja(BAND, N.fajaSup - N.fajaInf, M.reja, oFaja, 120, 2)
      r.position.set((W / 2) * S, N.fajaInf * S, z * S)
      add('CARPINTERIAS', r)
    }
  }

  /* ── 6. INTERIORES ────────────────────────────────────────────── */
  for (const b of [bandas[0], bandas[2]]) {
    const exterior = b.id === 'celdas-a' ? 0 : W
    for (let k = 0; k < tramos; k++) {
      for (const cz of MEDIDO.celdas.camaZ) {
        const z = cz + k * TRAMO
        const c = cucheta(M, {
          nombre: 'Cama cucheta', categoria: 'INTERIORES', modulo: b.id, origen: 'memoria',
          cota: 'Cada celda está equipada con camas cuchetas y sanitario amurados (memoria). Posición medida s/ planta.',
        })
        const xc = exterior === 0 ? T + MEDIDO.celdas.camaLargo / 2 : W - T - MEDIDO.celdas.camaLargo / 2
        c.position.set(xc * S, 0, z * S)
        add('INTERIORES', c)
      }
      /* Sanitario en la esquina de cada celda, contra el tabique intermedio y
         el muro exterior: es donde el plano ubica el nicho de ACCESO PLOMERÍA. */
      for (const lado of [-1, 1]) {
        const z = MEDIDO.celdas.tabiqueEnZ + k * TRAMO + lado * 620
        const s = sanitario(M, {
          nombre: 'Sanitario amurado', categoria: 'INTERIORES', modulo: b.id, origen: 'memoria',
          cota: 'Sanitario amurado (memoria descriptiva). Ubicado en la esquina de la celda contra el tabique intermedio, junto al ACCESO PLOMERÍA indicado en el plano.',
        })
        s.position.set((exterior === 0 ? 520 : W - 520) * S, 0, z * S)
        s.rotation.y = exterior === 0 ? Math.PI / 2 : -Math.PI / 2
        add('INTERIORES', s)
        /* tabique de privacidad del sanitario */
        add('INTERIORES', caja(60, 1800, 1100, (exterior === 0 ? 1080 : W - 1080), 900, z, M.chapaInterior, {
          nombre: 'Tabique de sanitario', categoria: 'INTERIORES', modulo: b.id, origen: 'medido',
          cota: 'Divisorio representativo — el plano no lo acota.',
        }))
      }
    }
  }
  /* ── Equipamiento del módulo de celaduría ──────────────────────
     La planta nombra los locales (baño celaduría · celaduría · duchas)
     pero no acota su equipamiento: las piezas siguientes son
     representativas del uso indicado, no cotas de proyecto. */
  const oRep = (nombre: string, cota: string): Pieza => ({
    nombre, categoria: 'INTERIORES', modulo: 'celaduria', origen: 'medido', cota,
  })

  /* Las puertas interiores de la celaduría se abren en z ≈ 360–1160; ese
     tramo se deja libre y el equipamiento va contra el muro de fondo. */
  const Z_LIBRE = 1650

  /* DUCHAS — cuatro boxes contra el muro de fondo, con paso de acceso */
  for (let i = 0; i < 4; i++) {
    const x = 5680 + i * 780
    const cota = 'Local DUCHAS indicado en planta. Equipamiento representativo — el plano no lo acota.'
    const zD = 2380
    add('INTERIORES', caja(740, 40, 900, x, 20, zD, M.sanitario, oRep('Receptáculo de ducha', cota)))
    add('INTERIORES', caja(60, 2100, 900, x - 390, 1050, zD, M.chapaInterior, oRep('Mampara divisoria', cota)))
    add('INTERIORES', caja(90, 90, 90, x, 1950, zD + 380, M.sanitario, oRep('Flor de ducha', cota)))
    add('INTERIORES', caja(60, 260, 60, x, 1750, zD + 430, M.sanitario, oRep('Caño de ducha', cota)))
    add('INTERIORES', caja(120, 120, 70, x, 1150, zD + 420, M.aceroClaro, oRep('Grifería', cota)))
    add('INTERIORES', caja(140, 20, 140, x, 42, zD, M.acero, oRep('Rejilla de desagüe', cota)))
  }
  add('INTERIORES', caja(60, 2100, 900, 8730, 1050, 2380, M.chapaInterior,
    oRep('Mampara divisoria', 'Local DUCHAS indicado en planta. Equipamiento representativo.')))
  /* banco del vestuario, sobre el muro divisorio y fuera del paso */
  add('INTERIORES', caja(2200, 80, 380, 6600, 450, Z_LIBRE - 250, M.chapaInterior,
    oRep('Banco de vestuario', 'Local DUCHAS indicado en planta. Equipamiento representativo.')))

  /* CELADURÍA — puesto de control contra el muro de fondo, dejando libre el
     eje entre el ingreso (x 3300) y la puerta al corredor (x 4500). */
  {
    const cota = 'Local CELADURÍA indicado en planta. Equipamiento representativo — el plano no lo acota.'
    add('INTERIORES', caja(1800, 120, 650, 2500, 900, 2500, M.chapaInterior, oRep('Mostrador de control', cota)))
    add('INTERIORES', caja(1800, 780, 80, 2500, 450, 2180, M.chapaInterior, oRep('Frente de mostrador', cota)))
    for (const dx of [-560, 0, 560]) {
      add('INTERIORES', caja(420, 90, 420, 2500 + dx, 480, 1780, M.colchon, oRep('Asiento', cota)))
      add('INTERIORES', caja(420, 540, 80, 2500 + dx, 750, 1590, M.colchon, oRep('Respaldo', cota)))
    }
    add('INTERIORES', caja(760, 1900, 420, 1900, 950, 2660, M.chapaInterior, oRep('Armario', cota)))
    add('INTERIORES', caja(1300, 60, 320, 4400, 1500, 2740, M.chapaInterior, oRep('Estante', cota)))
  }
  /* BAÑO CELADURÍA */
  {
    const cota = 'Local BAÑO CELADURÍA indicado en planta. Equipamiento representativo — el plano no lo acota.'
    /* Artefactos contra el muro de fondo: el vano de la puerta queda libre. */
    const b = sanitario(M, oRep('Sanitario', cota))
    b.position.set(420 * S, 0, 2560 * S)
    b.rotation.y = Math.PI
    add('INTERIORES', b)
    add('INTERIORES', caja(680, 40, 680, 1000, 20, 2540, M.sanitario, oRep('Receptáculo de ducha', cota)))
    add('INTERIORES', caja(90, 90, 90, 1000, 1950, 2820, M.sanitario, oRep('Flor de ducha', cota)))
    add('INTERIORES', caja(60, 2100, 700, 660, 1050, 2540, M.chapaInterior, oRep('Mampara divisoria', cota)))
    add('INTERIORES', caja(520, 620, 40, 420, 1520, 2860, M.vidrio, oRep('Espejo', cota)))
  }

  /* ── 7. INSTALACIONES (sólo lo documentado) ───────────────────── */
  {
    const oAc: Pieza = {
      nombre: 'ACOMETIDAS — electricidad, agua fría y cloaca', categoria: 'INSTALACIONES',
      origen: 'memoria',
      cota: 'En la parte trasera del módulo se encuentran ubicadas las acometidas de electricidad y plomería de agua fría y cloaca (memoria). Posición exacta y trazado POR DEFINIR.',
    }
    add('INSTALACIONES', caja(1400, 900, 260, W / 2, 900, L + 130, M.aceroClaro, oAc))
    for (const [x, mod] of [[T / 2, 'celdas-a'], [W - T / 2, 'celdas-b']] as [number, string][]) {
      for (let k = 0; k < tramos; k++) {
        add('INSTALACIONES', caja(280, 2000, 900, x, 1000, MEDIDO.celdas.puertaZ + k * TRAMO, M.aceroClaro, {
          nombre: 'ACCESO PLOMERÍA — nicho técnico', categoria: 'INSTALACIONES', modulo: mod,
          origen: 'cota', cota: 'Acceso de plomería indicado en el isométrico del plano. Trazado interior POR DEFINIR.',
        }))
      }
    }
  }

  /* ── Centrado + posiciones base para exploded view ────────────── */
  root.position.set(-(W / 2) * S, 0, -(L / 2) * S)

  const seleccionables: THREE.Mesh[] = []
  const dirExplode: Record<Categoria, THREE.Vector3> = {
    TECHOS: new THREE.Vector3(0, 1, 0),
    CARPINTERIAS: new THREE.Vector3(0, 0.45, 0),
    MUROS: new THREE.Vector3(0, 0, 0),
    ESTRUCTURA: new THREE.Vector3(0, 0.18, 0),
    INTERIORES: new THREE.Vector3(0, -0.05, 0),
    PISOS: new THREE.Vector3(0, -1, 0),
    FUNDACIONES: new THREE.Vector3(0, -1, 0),
    INSTALACIONES: new THREE.Vector3(0, 0.3, 0),
  }
  const MAG: Record<Categoria, number> = {
    TECHOS: 4.2, CARPINTERIAS: 2.2, MUROS: 3.0, ESTRUCTURA: 1.0,
    INTERIORES: 0.6, PISOS: 1.6, FUNDACIONES: 2.8, INSTALACIONES: 1.6,
  }

  for (const c of CATEGORIAS) {
    grupos[c.id].traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const cat = (o.userData.categoria ?? c.id) as Categoria
      let dir = dirExplode[cat].clone()
      if (cat === 'MUROS' || (cat === 'CARPINTERIAS' && Math.abs(o.getWorldPosition(new THREE.Vector3()).y) < 3)) {
        // los cerramientos se abren hacia afuera desde el eje del conjunto
        const p = new THREE.Vector3()
        o.getWorldPosition(p)
        const v = new THREE.Vector3(p.x, 0, p.z)
        dir = v.lengthSq() > 0.01 ? v.normalize() : new THREE.Vector3(1, 0, 0)
        dir.y = cat === 'CARPINTERIAS' ? 0.35 : 0.12
      }
      o.userData.base = o.position.clone()
      o.userData.explode = dir.normalize().multiplyScalar(MAG[cat])
      o.userData.categoria = cat
      if (o.userData.nombre) seleccionables.push(o)
    })
  }

  return {
    root, grupos, seleccionables, largo: L, tramos, materiales: M,
    dispose() {
      root.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.InstancedMesh) o.geometry.dispose()
      })
      if (!materiales) M.dispose()
    },
  }
}

export const DIMS = { W, CEL, TRAMO, BAND, T, N, PEND }
