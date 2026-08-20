/**
 * FUENTE DE VERDAD DEL PROYECTO
 * =============================
 * Todo dato de este archivo procede de la documentación entregada:
 *
 *   [PLANO] "Plano alcaldía penitenciaria 2025" — MJ COMERCIAL
 *           ANTEPROYECTO ALCALDÍA PENITENCIARIA · CONJUNTO / DISPOSICIÓN GENERAL
 *           Escala 1:50 · Medidas generales en mm · 20/08/2024 · Emisión 1
 *   [PANEL] "Módulos penitenciarios" — MJ COMERCIAL (memoria descriptiva)
 *
 * Cada dato lleva su procedencia:
 *   'cota'    → cota escrita en el plano (dato acotado, literal)
 *   'medido'  → NO está acotado; se obtuvo midiendo el dibujo a escala 1:50
 *               (el plano se verificó a escala exacta: 9000 mm = 510,0 pt)
 *   'memoria' → texto de la memoria descriptiva
 *   'definir' → NO consta en la documentación → POR DEFINIR
 */

export type Fuente = 'cota' | 'medido' | 'memoria' | 'definir'

export interface Dato {
  valor: number | null
  unidad?: string
  fuente: Fuente
  nota?: string
}

export const POR_DEFINIR = 'POR DEFINIR' as const

/* ────────────────────────────────────────────────────────────────
   1. CARÁTULA
   ──────────────────────────────────────────────────────────────── */
export const CARATULA = {
  titulo: 'ANTEPROYECTO ALCALDÍA PENITENCIARIA',
  empresa: 'MJ COMERCIAL',
  conjunto: 'CONJUNTO',
  lamina: 'DISPOSICIÓN GENERAL',
  utilizacion: 'MÓDULOS PENITENCIARIOS',
  escala: '1:50',
  escalaDetalles: '1:10',
  medidas: 'MEDIDAS GENERALES EN MM',
  fecha: '20/08/2024',
  emision: '1',
  numeroPlano: '—',
} as const

/* ────────────────────────────────────────────────────────────────
   2. COTAS DEL PLANO  (todas en mm)
   ──────────────────────────────────────────────────────────────── */
export const COTAS: Record<string, Dato> = {
  celaduriaAncho:   { valor: 9000,  fuente: 'cota', nota: '9000 módulo celaduría' },
  celaduriaFondo:   { valor: 3000,  fuente: 'cota', nota: '3000 módulo celaduría' },
  celdasLargo:      { valor: 12000, fuente: 'cota', nota: '12000 módulo celdas' },
  celdasAncho:      { valor: 3000,  fuente: 'cota', nota: '3000 módulo celdas' },
  patioAncho:       { valor: 3000,  fuente: 'cota', nota: '3000 ancho patio' },
  conjuntoLargo:    { valor: 15000, fuente: 'cota', nota: '15000' },
  alturaMaxima:     { valor: 3770,  fuente: 'cota', nota: '3770 altura máxima' },
  alturaInterior:   { valor: 2400,  fuente: 'cota', nota: '2400 altura interior' },
  fajaSuperior:     { valor: 500,   fuente: 'cota', nota: '500 — cota indicada en la elevación longitudinal, sobre la faja de reja superior del patio/corredor' },
}

/* Verificaciones geométricas hechas sobre el dibujo a escala 1:50 */
export const VERIFICACIONES = [
  { texto: 'Ancho total del conjunto', valor: '3000 + 3000 + 3000 = 9000 mm', ok: true },
  { texto: 'Largo total del conjunto', valor: '3000 + 12000 = 15000 mm', ok: true },
  { texto: 'Altura máxima', valor: '3459 (cumbrera s/ piso) + 311 (apoyos) = 3770 mm', ok: true },
  { texto: 'Faja de reja superior', valor: '3262 − 2760 = 502 ≈ 500 mm', ok: true },
] as const

/* ────────────────────────────────────────────────────────────────
   3. NIVELES  (mm respecto del nivel de piso terminado = 0)
   Obtenidos midiendo la elevación transversal a escala 1:50.
   El único valor ACOTADO es 3770 (altura máxima) y 2400 (altura interior);
   los intermedios son medidos y se declaran como tales.
   ──────────────────────────────────────────────────────────────── */
export const NIVELES = {
  baseApoyos:      { valor: -311, fuente: 'medido' as Fuente, nota: 'base de apoyos de nivelación' },
  fondoPiso:       { valor: -126, fuente: 'medido' as Fuente, nota: 'cara inferior del paquete de piso' },
  piso:            { valor: 0,    fuente: 'medido' as Fuente, nota: 'nivel de piso terminado' },
  cielorraso:      { valor: 2400, fuente: 'cota'   as Fuente, nota: '2400 altura interior' },
  techoModulos:    { valor: 2586, fuente: 'medido' as Fuente, nota: 'cara superior techo de módulos' },
  fajaInferior:    { valor: 2760, fuente: 'medido' as Fuente, nota: 'arranque de la faja de reja superior' },
  fajaSuperior:    { valor: 3262, fuente: 'medido' as Fuente, nota: 'fin de la faja de reja superior (500 mm)' },
  techoSupBajo:    { valor: 3312, fuente: 'medido' as Fuente, nota: 'arranque del techo superior' },
  cumbrera:        { valor: 3459, fuente: 'medido' as Fuente, nota: 'cumbrera — 3770 mm desde la base de apoyos' },
}

/* ────────────────────────────────────────────────────────────────
   4. GEOMETRÍA MEDIDA SOBRE EL PLANO (no acotada)
   ──────────────────────────────────────────────────────────────── */
export const MEDIDO = {
  espesorMuro: 120,          // coincide con el parante principal 120×120
  /* Subdivisión del módulo de celaduría, de izquierda a derecha en planta */
  celaduria: {
    banoAncho:      1260,
    celaduriaAncho: 3640,
    duchasAncho:    3630,
  },
  /* Módulo de celdas: tabique intermedio que lo divide en dos celdas */
  celdas: {
    tabiqueEnZ:   9000,      // desde el extremo de celaduría
    celdaLibre:   5820,      // largo libre de cada celda
    camas:        3,         // cuchetas por celda (3 × 2 niveles = 6 plazas)
    camaLargo:    1900,
    camaAncho:    700,
    camaPaso:     1400,      // separación entre ejes de cuchetas
    camaZ:        [4174, 5573, 6974, 11026, 12428, 13827], // ejes s/ plano
    puertaZ:      9000,      // puerta doble en muro exterior, a mitad del módulo
  },
} as const

/* ────────────────────────────────────────────────────────────────
   5. MÓDULOS DEL SISTEMA
   ──────────────────────────────────────────────────────────────── */
export interface Modulo {
  id: string
  codigo: string
  nombre: string
  x: [number, number]      // mm
  z: [number, number]      // mm
  texto: string
  datos: { k: string; v: string; fuente: Fuente }[]
  doc?: string
}

export const MODULOS: Modulo[] = [
  {
    id: 'celaduria', codigo: '01', nombre: 'CELADURÍA',
    x: [0, 9000], z: [0, 3000],
    texto: 'Módulo de un extremo. Contiene la celaduría propiamente dicha, su baño y el sector de duchas. Es el punto de ingreso al conjunto.',
    datos: [
      { k: 'Ancho', v: '9000 mm', fuente: 'cota' },
      { k: 'Fondo', v: '3000 mm', fuente: 'cota' },
      { k: 'Locales', v: 'Baño celaduría · Celaduría · Duchas', fuente: 'cota' },
      { k: 'Acceso', v: 'Ingreso celaduría', fuente: 'cota' },
    ],
    doc: 'planta',
  },
  {
    id: 'celdas-a', codigo: '02', nombre: 'MÓDULO DE CELDAS',
    x: [0, 3000], z: [3000, 15000],
    texto: 'Dos módulos de celdas enfrentados. Cada módulo aloja hasta doce reclusos separados en dos celdas, equipadas con camas cuchetas y sanitario amurados.',
    datos: [
      { k: 'Largo', v: '12000 mm', fuente: 'cota' },
      { k: 'Ancho', v: '3000 mm', fuente: 'cota' },
      { k: 'Celdas', v: '2 por módulo', fuente: 'memoria' },
      { k: 'Capacidad', v: 'hasta 12 reclusos por módulo', fuente: 'memoria' },
      { k: 'Equipamiento', v: 'Camas cuchetas y sanitario amurados', fuente: 'memoria' },
    ],
    doc: 'planta',
  },
  {
    id: 'patio', codigo: '03', nombre: 'PATIO / CORREDOR',
    x: [3000, 6000], z: [3000, 15000],
    texto: 'Módulo que se ensambla in situ: incluye el piso, el techo que se apoya sobre los demás módulos y el portón del extremo final. Ofrece espacio común diurno y da acceso a cada celda.',
    datos: [
      { k: 'Ancho', v: '3000 mm', fuente: 'cota' },
      { k: 'Largo', v: '12000 mm', fuente: 'cota' },
      { k: 'Montaje', v: 'Ensamblado in situ', fuente: 'cota' },
      { k: 'Cierre', v: 'Portón final patio/corredor', fuente: 'cota' },
      { k: 'Control', v: 'Puertas de seguridad en cada extremo del corredor', fuente: 'memoria' },
    ],
    doc: 'seccion-bb',
  },
  {
    id: 'celdas-b', codigo: '04', nombre: 'MÓDULO DE CELDAS',
    x: [6000, 9000], z: [3000, 15000],
    texto: 'Módulo de celdas enfrentado al anterior. El crecimiento del conjunto se produce sumando módulos de celdas en sentido longitudinal.',
    datos: [
      { k: 'Largo', v: '12000 mm', fuente: 'cota' },
      { k: 'Ancho', v: '3000 mm', fuente: 'cota' },
      { k: 'Crecimiento', v: 'Longitudinal', fuente: 'cota' },
    ],
    doc: 'planta',
  },
]

/* Locales interiores del módulo de celaduría (medidos sobre planta) */
export const LOCALES = [
  { id: 'bano',      nombre: 'BAÑO CELADURÍA', x: [120, 1380] as [number, number],  z: [120, 2880] as [number, number] },
  { id: 'celaduria-local', nombre: 'CELADURÍA', x: [1500, 5130] as [number, number], z: [120, 2880] as [number, number] },
  { id: 'duchas',    nombre: 'DUCHAS',          x: [5250, 8880] as [number, number], z: [120, 2880] as [number, number] },
]

/* ────────────────────────────────────────────────────────────────
   6. DETALLES CONSTRUCTIVOS  (literal del plano, escala 1:10)
   ──────────────────────────────────────────────────────────────── */
export interface Capa { nombre: string; espesor: string; cara?: 'EXTERIOR' | 'INTERIOR' }
export interface Detalle {
  id: string; codigo: string; titulo: string; escala: string; doc: string
  capas: Capa[]
  perfiles: { nombre: string; perfil: string }[]
  nota?: string
}

export const DETALLES: Detalle[] = [
  {
    id: 'muros', codigo: 'D-01', titulo: 'MUROS', escala: '1:10', doc: 'det-muros',
    capas: [
      { nombre: 'Chapa ondulada pintada', espesor: POR_DEFINIR, cara: 'EXTERIOR' },
      { nombre: 'Aislante', espesor: POR_DEFINIR },
      { nombre: 'Chapa', espesor: '3,2 mm', cara: 'INTERIOR' },
    ],
    perfiles: [
      { nombre: 'Parante principal', perfil: 'Tubo 120 × 120 × 3,2 mm' },
      { nombre: 'Parante secundario', perfil: 'Tubo 120 × 60 × 2 mm' },
    ],
  },
  {
    id: 'pisos', codigo: 'D-02', titulo: 'PISOS', escala: '1:10', doc: 'det-pisos',
    capas: [
      { nombre: 'Chapa antideslizante', espesor: '3,2 mm', cara: 'INTERIOR' },
      { nombre: 'Aislante', espesor: POR_DEFINIR },
      { nombre: 'Chapa', espesor: '2 mm', cara: 'EXTERIOR' },
    ],
    perfiles: [{ nombre: 'Estructura de piso', perfil: 'Perfil C 100 × 50 × 2 mm' }],
  },
  {
    id: 'techo', codigo: 'D-03', titulo: 'TECHO', escala: '1:10', doc: 'det-techo',
    capas: [
      { nombre: 'Chapa galvanizada T101', espesor: POR_DEFINIR, cara: 'EXTERIOR' },
      { nombre: 'Aislante', espesor: POR_DEFINIR },
      { nombre: 'Chapa', espesor: '3,2 mm', cara: 'INTERIOR' },
      { nombre: 'Costillas chapa', espesor: '3,2 mm' },
    ],
    perfiles: [{ nombre: 'Estructura de techo', perfil: 'Tubo 50 × 50 × 2 mm' }],
  },
  {
    id: 'uniones', codigo: 'D-04', titulo: 'UNIONES ENTRE MÓDULOS', escala: POR_DEFINIR, doc: '',
    capas: [],
    perfiles: [],
    nota: 'La documentación entregada no incluye un detalle de unión entre módulos. Consta únicamente que el módulo patio/corredor se ensambla in situ, que su techo se apoya sobre los demás módulos y que el crecimiento se produce sumando módulos en sentido longitudinal.',
  },
]

/* Fichas de elementos constructivos, para vincular modelo ↔ documentación */
export interface Ficha {
  id: string; nombre: string; tipo: string; perfil?: string; espesor?: string
  detalle?: string; fuente: Fuente
}

export const FICHAS: Ficha[] = [
  { id: 'parante-principal', nombre: 'PARANTE PRINCIPAL', tipo: 'TUBO', perfil: '120 × 120 × 3,2 mm', detalle: 'muros', fuente: 'cota' },
  { id: 'parante-secundario', nombre: 'PARANTE SECUNDARIO', tipo: 'TUBO', perfil: '120 × 60 × 2 mm', detalle: 'muros', fuente: 'cota' },
  { id: 'perfil-c', nombre: 'ESTRUCTURA DE PISO', tipo: 'PERFIL C', perfil: '100 × 50 × 2 mm', detalle: 'pisos', fuente: 'cota' },
  { id: 'tubo-techo', nombre: 'ESTRUCTURA DE TECHO', tipo: 'TUBO', perfil: '50 × 50 × 2 mm', detalle: 'techo', fuente: 'cota' },
  { id: 'chapa-ondulada', nombre: 'CHAPA ONDULADA PINTADA', tipo: 'CERRAMIENTO EXTERIOR', espesor: POR_DEFINIR, detalle: 'muros', fuente: 'cota' },
  { id: 'chapa-32', nombre: 'CHAPA', tipo: 'CERRAMIENTO INTERIOR', espesor: '3,2 mm', detalle: 'muros', fuente: 'cota' },
  { id: 'chapa-antideslizante', nombre: 'CHAPA ANTIDESLIZANTE', tipo: 'SOLADO', espesor: '3,2 mm', detalle: 'pisos', fuente: 'cota' },
  { id: 'chapa-2', nombre: 'CHAPA', tipo: 'FONDO DE PISO', espesor: '2 mm', detalle: 'pisos', fuente: 'cota' },
  { id: 'chapa-galv', nombre: 'CHAPA GALVANIZADA T101', tipo: 'CUBIERTA', espesor: POR_DEFINIR, detalle: 'techo', fuente: 'cota' },
  { id: 'costillas', nombre: 'COSTILLAS CHAPA', tipo: 'REFUERZO', espesor: '3,2 mm', detalle: 'techo', fuente: 'cota' },
  { id: 'aislante', nombre: 'AISLANTE', tipo: 'AISLACIÓN', espesor: POR_DEFINIR, detalle: 'muros', fuente: 'cota' },
]

/* ────────────────────────────────────────────────────────────────
   7. MEMORIA DESCRIPTIVA  (literal del panel / plano)
   ──────────────────────────────────────────────────────────────── */
export const MEMORIA = {
  unidadMinima:
    'La unidad mínima consiste en un módulo de celaduría en un extremo, seguido por dos módulos de celdas enfrentados. El espacio entre estos últimos se completa con un módulo patio/corredor que se ensambla in situ, incluyendo el piso, el techo que se apoya sobre los demás módulos y el portón del extremo final.',
  crecimiento:
    'El crecimiento de la alcaldía se produce sumando módulos de celdas en sentido longitudinal, junto a lo necesario para prolongar el corredor central.',
  patio:
    'El patio/corredor ofrece un espacio común para los reclusos durante el día y facilita el acceso a cada celda, asegurando un flujo eficiente y seguro de personal y reclusos dentro del módulo. Puertas de seguridad en cada extremo del corredor garantizan el control de acceso.',
  acometidas:
    'En la parte trasera del módulo se encuentran ubicadas las acometidas de electricidad y plomería de agua fría y cloaca.',
  material:
    'Cada módulo es fabricado en acero y recubierto con pintura epoxi de alta resistencia y durabilidad. Con un ancho mayor al de un contenedor marítimo, se ofrece suficiente espacio para el alojamiento de hasta doce reclusos en cada módulo, separados en dos celdas y respetando la superficie mínima recomendada por persona. Cada celda está equipada con camas cuchetas y sanitario amurados.',
  origen:
    'Atendiendo a la saturación del sistema penitenciario surge la idea de desarrollar módulos que permitan aumentar la capacidad total, como una respuesta rápida y eficiente desde su ejecución.',
} as const

/* ────────────────────────────────────────────────────────────────
   8. INSTALACIONES
   La documentación entregada NO incluye planos de instalaciones.
   Lo único documentado son las acometidas y un acceso de plomería.
   Todo lo demás queda POR DEFINIR — no se representa trazado alguno.
   ──────────────────────────────────────────────────────────────── */
export type EstadoInst = 'documentado' | 'definir'

export interface Instalacion {
  id: string; nombre: string; color: string; estado: EstadoInst; nota: string
}

export const INSTALACIONES: Instalacion[] = [
  { id: 'electrica', nombre: 'ACOMETIDA ELÉCTRICA', color: '#f0b323', estado: 'documentado',
    nota: 'Acometida ubicada en la parte trasera del módulo. Trazado interior POR DEFINIR.' },
  { id: 'agua-fria', nombre: 'AGUA FRÍA', color: '#4a9fd8', estado: 'documentado',
    nota: 'Acometida de plomería de agua fría en la parte trasera del módulo. Trazado interior POR DEFINIR.' },
  { id: 'cloacal', nombre: 'DESAGÜE CLOACAL', color: '#8a7a5c', estado: 'documentado',
    nota: 'Acometida de cloaca en la parte trasera del módulo. Acceso de plomería indicado en el isométrico. Trazado interior POR DEFINIR.' },
  { id: 'pluvial', nombre: 'DESAGÜE PLUVIAL', color: '#5fa88a', estado: 'definir',
    nota: 'No consta en la documentación entregada.' },
  { id: 'agua-caliente', nombre: 'AGUA CALIENTE', color: '#d4674a', estado: 'definir',
    nota: 'No consta en la documentación entregada.' },
  { id: 'ventilacion', nombre: 'VENTILACIÓN', color: '#9a8fb5', estado: 'definir',
    nota: 'No consta en la documentación entregada como sistema. El plano indica reja perimetral superior sobre el patio/corredor y rejas en muros exteriores.' },
]

/* Puntos documentados en el plano */
export const PUNTOS_DOC = [
  { id: 'ingreso', nombre: 'INGRESO CELADURÍA', x: 4500, z: 0,     fuente: 'cota' as Fuente },
  { id: 'porton',  nombre: 'PORTÓN FINAL PATIO/CORREDOR', x: 4500, z: 15000, fuente: 'cota' as Fuente },
  { id: 'plomeria', nombre: 'ACCESO PLOMERÍA', x: 0, z: 1500, fuente: 'cota' as Fuente },
]

/* ────────────────────────────────────────────────────────────────
   9. CRECIMIENTO MODULAR
   ──────────────────────────────────────────────────────────────── */
export interface Etapa { n: number; tramos: number; largo: number; plazas: number; label: string }

export const ETAPAS: Etapa[] = [1, 2, 3, 4].map((n) => ({
  n,
  tramos: n,
  largo: 3000 + 12000 * n,
  plazas: 24 * n,
  label: n === 1 ? 'UNIDAD MÍNIMA' : `+ ${n - 1} TRAMO${n - 1 > 1 ? 'S' : ''}`,
}))

/* ────────────────────────────────────────────────────────────────
   10. EMPRESA
   ──────────────────────────────────────────────────────────────── */
export const EMPRESA = {
  nombre: 'MJ COMERCIAL',
  descripcion: 'Primera fábrica argentina de vagones de carga. Ejecución de obras en serie y de gran envergadura.',
  planta: 'Av. Bautista Buriasco 41 — (2445) María Juana, Santa Fe, Argentina',
  administracion: 'Av. Libertador 13687, 1° piso — (1640) Martínez, Buenos Aires, Argentina',
} as const

/* Utilidades */
export const mm = (v: number) => v / 1000          // mm → metros (unidad del modelo 3D)
export const fmt = (v: number) => v.toLocaleString('es-AR')
