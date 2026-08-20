import { create } from 'zustand'
import type { Categoria } from './three/build'
import { CATEGORIAS } from './three/build'
import { INSTALACIONES } from './data/project'

export type Vista = 'aerea' | 'frontal' | 'lateral' | 'planta' | 'corte' | 'libre'
export type Modo = 'presentacion' | 'tecnico'

export interface Seleccion {
  nombre: string
  categoria: Categoria
  modulo?: string
  ficha?: string
  detalle?: string
  cota?: string
  origen?: 'cota' | 'medido' | 'memoria'
}

export interface Corte { activo: boolean; eje: 'x' | 'y' | 'z'; pos: number; invertido: boolean }

/** Cortes disponibles. A-A y B-B son los de la lámina; los otros dos se
 *  agregan para poder mirar el conjunto a lo largo y por la celaduría. */
export type PresetCorte = 'A-A' | 'B-B' | 'LONGITUDINAL' | 'CELADURIA'

export const PRESETS_CORTE: { id: PresetCorte; label: string; desc: string }[] = [
  { id: 'A-A', label: 'CORTE A-A', desc: 'Planta — según la lámina' },
  { id: 'B-B', label: 'CORTE B-B', desc: 'Transversal por celdas y patio — según la lámina' },
  { id: 'LONGITUDINAL', label: 'LONGITUDINAL', desc: 'A lo largo del patio/corredor' },
  { id: 'CELADURIA', label: 'POR CELADURÍA', desc: 'Transversal por baño, celaduría y duchas' },
]

export type Linea = 'alcaldia' | 'ferro'
/** null = pantalla de entrada, todavía sin línea elegida */
export type LineaElegida = Linea | null

interface Estado {
  /** null mientras el visitante no eligió línea: se muestra la portada de acceso. */
  linea: LineaElegida
  setLinea: (l: LineaElegida) => void

  seccion: number
  irA: (n: number) => void

  cargado: boolean
  setCargado: (v: boolean) => void

  tramos: number
  setTramos: (n: number) => void

  capas: Record<Categoria, boolean>
  toggleCapa: (c: Categoria) => void
  setCapas: (v: Partial<Record<Categoria, boolean>>) => void

  instalaciones: Record<string, boolean>
  toggleInstalacion: (id: string) => void
  modoInstalaciones: boolean
  setModoInstalaciones: (v: boolean) => void

  vista: Vista
  setVista: (v: Vista) => void

  foco: { x: number; y: number; z: number; dist: number } | null
  enfocar: (f: { x: number; y: number; z: number; dist: number } | null) => void

  explotado: boolean
  setExplotado: (v: boolean) => void

  corte: Corte
  setCorte: (c: Partial<Corte>) => void
  cortePreset: (p: PresetCorte | null) => void

  modo: Modo
  setModo: (m: Modo) => void

  seleccion: Seleccion | null
  seleccionar: (s: Seleccion | null) => void

  doc: string | null
  abrirDoc: (d: string | null) => void

  moduloActivo: string | null
  setModuloActivo: (m: string | null) => void

  presentando: boolean
  setPresentando: (v: boolean) => void
  pasoPres: number
  setPasoPres: (n: number) => void

  reset: () => void
}

const capasIniciales = Object.fromEntries(
  CATEGORIAS.map((c) => [c.id, c.on]),
) as Record<Categoria, boolean>

const instIniciales = Object.fromEntries(INSTALACIONES.map((i) => [i.id, false]))

export const useApp = create<Estado>((set, get) => ({
  linea: null,
  setLinea: (l) => set({ linea: l, seccion: 0, seleccion: null, presentando: false }),

  seccion: 0,
  irA: (n) => set({ seccion: n, seleccion: null }),

  cargado: false,
  setCargado: (v) => set({ cargado: v }),

  tramos: 1,
  setTramos: (n) => set({ tramos: Math.min(4, Math.max(1, n)), seleccion: null }),

  capas: { ...capasIniciales },
  toggleCapa: (c) => set((s) => ({ capas: { ...s.capas, [c]: !s.capas[c] } })),
  setCapas: (v) => set((s) => ({ capas: { ...s.capas, ...v } })),

  instalaciones: { ...instIniciales },
  toggleInstalacion: (id) =>
    set((s) => ({ instalaciones: { ...s.instalaciones, [id]: !s.instalaciones[id] } })),
  modoInstalaciones: false,
  setModoInstalaciones: (v) =>
    set((s) => ({
      modoInstalaciones: v,
      capas: { ...s.capas, INSTALACIONES: v ? true : s.capas.INSTALACIONES },
    })),

  vista: 'aerea',
  setVista: (v) => set({ vista: v, foco: null }),

  foco: null,
  enfocar: (f) => set({ foco: f, vista: 'libre' }),

  explotado: false,
  setExplotado: (v) => set({ explotado: v }),

  corte: { activo: false, eje: 'z', pos: 0.5, invertido: false },
  setCorte: (c) => set((s) => ({ corte: { ...s.corte, ...c } })),
  cortePreset: (p) => {
    if (p === null) return set((s) => ({ corte: { ...s.corte, activo: false } }))
    switch (p) {
      case 'A-A':
        return set({ corte: { activo: true, eje: 'y', pos: 0.42, invertido: false }, vista: 'planta' })
      case 'B-B':
        return set({ corte: { activo: true, eje: 'z', pos: 0.4, invertido: false }, vista: 'frontal' })
      case 'LONGITUDINAL':
        return set({ corte: { activo: true, eje: 'x', pos: 0.5, invertido: false }, vista: 'lateral' })
      case 'CELADURIA':
        return set({ corte: { activo: true, eje: 'z', pos: 0.19, invertido: false }, vista: 'frontal' })
    }
  },

  modo: 'presentacion',
  setModo: (m) => set({ modo: m }),

  seleccion: null,
  seleccionar: (s) => set({ seleccion: s }),

  doc: null,
  abrirDoc: (d) => set({ doc: d }),

  moduloActivo: null,
  setModuloActivo: (m) => set({ moduloActivo: m }),

  presentando: false,
  setPresentando: (v) => set({ presentando: v, pasoPres: 0 }),
  pasoPres: 0,
  setPasoPres: (n) => set({ pasoPres: n }),

  reset: () =>
    set({
      capas: { ...capasIniciales },
      instalaciones: { ...instIniciales },
      modoInstalaciones: false,
      vista: 'aerea',
      foco: null,
      explotado: false,
      corte: { activo: false, eje: 'z', pos: 0.5, invertido: false },
      seleccion: null,
      moduloActivo: null,
      tramos: get().tramos,
    }),
}))
