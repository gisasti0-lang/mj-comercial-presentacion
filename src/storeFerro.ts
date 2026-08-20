import { create } from 'zustand'
import { CATS_BOGIE, type CatBogie } from './three/bogie'

export type VistaBogie = 'aerea' | 'frontal' | 'lateral' | 'planta' | 'libre'

export interface SeleccionBogie {
  nombre: string; categoria: CatBogie; espec?: string; cantidad?: string
  origen?: 'cota' | 'medido' | 'ficha'
}

export interface CorteFerro { activo: boolean; eje: 'x' | 'y' | 'z'; pos: number; invertido: boolean }

export const EJES_CORTE: { id: 'x' | 'y' | 'z'; label: string }[] = [
  { id: 'x', label: 'TRANSVERSAL' },
  { id: 'z', label: 'LONGITUDINAL' },
  { id: 'y', label: 'HORIZONTAL' },
]

interface EstadoFerro {
  corte: CorteFerro
  setCorte: (c: Partial<CorteFerro>) => void

  capasCG: Record<string, boolean>
  toggleCapaCG: (c: string) => void
  explotadoCG: boolean
  setExplotadoCG: (v: boolean) => void
  sobreVagon: boolean
  setSobreVagon: (v: boolean) => void
  dosContenedores: boolean
  setDosContenedores: (v: boolean) => void
  compuertasAbiertas: boolean
  setCompuertasAbiertas: (v: boolean) => void
  seleccionCG: { nombre: string; categoria: string; espec?: string } | null
  seleccionarCG: (s: { nombre: string; categoria: string; espec?: string } | null) => void

  vagon: string
  setVagon: (id: string) => void
  capasVagon: Record<string, boolean>
  toggleCapaVagon: (c: string) => void
  explotadoVagon: boolean
  setExplotadoVagon: (v: boolean) => void
  seleccionVagon: { nombre: string; categoria: string; espec?: string } | null
  seleccionarVagon: (s: { nombre: string; categoria: string; espec?: string } | null) => void

  capas: Record<CatBogie, boolean>
  toggleCapa: (c: CatBogie) => void
  vista: VistaBogie
  setVista: (v: VistaBogie) => void
  explotado: boolean
  setExplotado: (v: boolean) => void
  seleccion: SeleccionBogie | null
  seleccionar: (s: SeleccionBogie | null) => void
  reset: () => void
}

const inicial = Object.fromEntries(CATS_BOGIE.map((c) => [c.id, c.on])) as Record<CatBogie, boolean>

const capasVagonInicial: Record<string, boolean> = {
  BOGIES: true, BASTIDOR: true, CAJA: true, EQUIPAMIENTO: true,
}

const capasCGInicial: Record<string, boolean> = {
  ESTRUCTURA: true, CERRAMIENTO: true, TOLVAS: true, DESCARGA: true, CARGA: true, ACCESOS: true,
}

export const useFerro = create<EstadoFerro>((set) => ({
  corte: { activo: false, eje: 'z', pos: 0.5, invertido: false },
  setCorte: (c) => set((s) => ({ corte: { ...s.corte, ...c } })),

  capasCG: { ...capasCGInicial },
  toggleCapaCG: (c) => set((s) => ({ capasCG: { ...s.capasCG, [c]: !s.capasCG[c] } })),
  explotadoCG: false,
  setExplotadoCG: (v) => set({ explotadoCG: v }),
  /* Transporte y descarga se excluyen: con el contenedor apoyado sobre la
     plataforma, las hojas abrirían contra el piso del vagón. */
  sobreVagon: true,
  setSobreVagon: (v) => set(v ? { sobreVagon: true, compuertasAbiertas: false } : { sobreVagon: false }),
  dosContenedores: true,
  setDosContenedores: (v) => set({ dosContenedores: v }),
  compuertasAbiertas: false,
  setCompuertasAbiertas: (v) => set(v ? { compuertasAbiertas: true, sobreVagon: false } : { compuertasAbiertas: false }),
  seleccionCG: null,
  seleccionarCG: (x) => set({ seleccionCG: x }),

  vagon: 'tolva-pedrero',
  setVagon: (id) => set({ vagon: id, seleccionVagon: null, explotadoVagon: false }),
  capasVagon: { ...capasVagonInicial },
  toggleCapaVagon: (c) => set((s) => ({ capasVagon: { ...s.capasVagon, [c]: !s.capasVagon[c] } })),
  explotadoVagon: false,
  setExplotadoVagon: (v) => set({ explotadoVagon: v }),
  seleccionVagon: null,
  seleccionarVagon: (x) => set({ seleccionVagon: x }),

  capas: { ...inicial },
  toggleCapa: (c) => set((s) => ({ capas: { ...s.capas, [c]: !s.capas[c] } })),
  vista: 'aerea',
  setVista: (v) => set({ vista: v }),
  explotado: false,
  setExplotado: (v) => set({ explotado: v }),
  seleccion: null,
  seleccionar: (s) => set({ seleccion: s }),
  reset: () => set({
    capas: { ...inicial }, vista: 'aerea', explotado: false, seleccion: null,
    corte: { activo: false, eje: 'z', pos: 0.5, invertido: false },
  }),
}))
