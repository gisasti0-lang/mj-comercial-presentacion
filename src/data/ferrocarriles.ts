/**
 * FUENTE DE VERDAD — LÍNEA FERROVIARIA
 * ====================================
 *   [CATALOGO] Catálogo de Componentes Ferroviarios (lámina institucional)
 *   [VAGONES]  Vagones de Carga — Diseño, fabricación y adaptación (lámina institucional)
 *   [SABB]     Bogie de chapa soldada S.A.B.B. — Trocha 1676 con control de marcha (ficha gráfica)
 *   [ET-1676]  ET-BOGIE-1676 Rev. 00 — SABB / Buriasco — 23/10/2024
 *   [CG35]     Plano CG35 — Contenedor granero 35 m³ — MJ COMERCIAL — 1:20 — 11/03/2022 — emisión 2
 *   [GALIBO]   Proyecto Contenedor Granero — comparativo de gálibo (lámina MJ Comercial)
 */

import type { Fuente } from './project'

export type Criticidad = 'alta' | 'media'

export interface Componente {
  codigo: string
  nombre: string
  en: string
  criticidad: Criticidad
  nota?: string
  nuevo?: boolean
}

export interface GrupoComponentes {
  n: string
  id: string
  titulo: string
  en: string
  items: Componente[]
}

/* ── 1. CATÁLOGO DE COMPONENTES ───────────────────────────────────
   Transcripción literal del catálogo. La criticidad es la que asigna
   la propia lámina. */
export const COMPONENTES: GrupoComponentes[] = [
  {
    n: '01', id: 'freno', titulo: 'SISTEMA DE FRENO', en: 'Brake system',
    items: [
      { codigo: 'FRN-001', nombre: 'Cilindro de freno 10" × 12"', en: 'Brake cylinder 10" x 12"', criticidad: 'alta' },
      { codigo: 'FRN-002', nombre: 'Depósito de freno (combinado)', en: 'Combined brake reservoir', criticidad: 'alta' },
      { codigo: 'FRN-003', nombre: 'Travesaño de freno (unit beam)', en: 'Unit-type brake beam', criticidad: 'alta' },
      { codigo: 'FRN-004', nombre: 'Timonería de freno', en: 'Brake rigging', criticidad: 'alta' },
      { codigo: 'FRN-005', nombre: 'Regulador automático de freno', en: 'Automatic slack adjuster', criticidad: 'alta' },
      { codigo: 'FRN-006', nombre: 'Llaves angulares 1¼"', en: 'Angle cocks 1¼"', criticidad: 'alta' },
      { codigo: 'FRN-007', nombre: 'Mangas de freno (con glad hands)', en: 'Air brake hoses (with glad hands)', criticidad: 'alta' },
      { codigo: 'FRN-008', nombre: 'Freno de mano (volante vertical)', en: 'Hand brake (vertical wheel type)', criticidad: 'alta' },
      { codigo: 'FRN-009', nombre: 'Cañería de freno', en: 'Brake piping', criticidad: 'alta' },
      { codigo: 'FRN-010', nombre: 'Leva de freno', en: 'Brake cam', criticidad: 'media' },
      { codigo: 'FRN-011', nombre: 'Barra de empuje', en: 'Push rod', criticidad: 'media' },
      { codigo: 'FRN-012', nombre: 'Clavijas y pasadores de freno', en: 'Brake pins, cotters and retainers', criticidad: 'media' },
    ],
  },
  {
    n: '02', id: 'bogie', titulo: 'BOGIE', en: 'Truck',
    items: [
      { codigo: 'BGE-001', nombre: 'Bogie de chapa soldada (three-piece)', en: 'Welded plate three-piece truck', criticidad: 'alta' },
      { codigo: 'BGE-002', nombre: 'Aro separador centro de bogie', en: 'Center bowl wear ring', criticidad: 'media' },
      { codigo: 'BGE-003', nombre: 'Disco separador centro de bogie', en: 'Center plate liner / disc', criticidad: 'media' },
      { codigo: 'BGE-004', nombre: 'Placas laterales (constant contact)', en: 'Side bearings (Constant Contact)', criticidad: 'alta' },
      { codigo: 'BGE-005', nombre: 'Resorte Barber de suspensión', en: 'Barber suspension coil spring', criticidad: 'alta' },
      { codigo: 'BGE-006', nombre: 'Resorte de suspensión exterior', en: 'Outer coil spring', criticidad: 'alta' },
      { codigo: 'BGE-007', nombre: 'Resorte de suspensión interior', en: 'Inner coil spring', criticidad: 'alta' },
      { codigo: 'BGE-008', nombre: 'Adaptadores 5½" × 10"', en: 'Bearing adapters 5½" x 10"', criticidad: 'alta' },
      { codigo: 'BGE-009', nombre: 'Cuñas de fricción Ride Control', en: 'Ride Control friction wedges', criticidad: 'alta' },
      { codigo: 'BGE-010', nombre: 'Adaptador ferroviario', en: 'Railway adapter', criticidad: 'alta', nuevo: true,
        nota: 'Permite interconectar distintos tipos de equipos ferroviarios. Alta resistencia estructural. Fabricación certificada bajo normas AAR.' },
    ],
  },
  {
    n: '03', id: 'enganche', titulo: 'SISTEMA DE ENGANCHE', en: 'Coupling system',
    items: [
      { codigo: 'ENG-001', nombre: 'Boquilla para gancho y enganche', en: 'Coupler yoke', criticidad: 'alta' },
      { codigo: 'ENG-002', nombre: 'Boquilla para enganche automático (Type E)', en: 'Automatic coupler yoke (Type E)', criticidad: 'alta' },
      { codigo: 'ENG-003', nombre: 'Kit de colocación de enganche automático', en: 'Automatic coupler installation kit', criticidad: 'alta' },
    ],
  },
]

/* Contenido típico del kit de enganche ENG-003 */
export const KIT_ENGANCHE = [
  ['Cabeza completa', 'Coupler head'], ['Knuckle', 'Knuckle'],
  ['Pasador de knuckle', 'Knuckle pin'], ['Seguro', 'Lock'],
  ['Levantador de seguro', 'Lock-lift'], ['Llave', 'Key'],
  ['Bloque seguidor', 'Follower block'], ['Resorte de tiro', 'Draft gear'],
  ['Boquilla', 'Yoke'], ['Pasadores y chavetas', 'Pins & cotters'],
] as const

export const CRITICIDAD_DEF: Record<Criticidad, { label: string; desc: string; color: string }> = {
  alta:  { label: 'ALTA', color: '#c8402f', desc: 'Falla puede provocar pérdida de frenado o seguridad operativa.' },
  media: { label: 'MEDIA', color: '#d8a029', desc: 'Falla puede afectar el rendimiento o la confiabilidad.' },
}

export const NORMAS = [
  { sigla: 'AAR', nombre: 'Association of American Railroads' },
  { sigla: 'ASTM', nombre: 'American Society for Testing and Materials' },
  { sigla: 'AREMA', nombre: 'American Railway Engineering and Maintenance-of-Way Association' },
] as const

/* ── 2. VAGONES DE CARGA ──────────────────────────────────────── */
export interface Vagon { nombre: string; desc: string }
export interface FamiliaVagones { id: string; titulo: string; desc: string; vagones: Vagon[] }

export const VAGONES: FamiliaVagones[] = [
  {
    id: 'minerales', titulo: 'TRANSPORTE DE MINERALES Y GRANOS',
    desc: 'Para operaciones de minerales, granos, fertilizantes y productos a granel.',
    vagones: [
      { nombre: 'Vagón hopper abierto', desc: 'Transporte de minerales de hierro, manganeso, carbón y áridos.' },
      { nombre: 'Vagón hopper cerrado', desc: 'Descarga por gravedad con compuertas inferiores. Protección del producto y mayor eficiencia.' },
      { nombre: 'Vagón tolva pedrero', desc: 'Ideal para piedra, balasto y materiales para la infraestructura ferroviaria.' },
      { nombre: 'Vagón cisterna líquidos a granel', desc: 'Transporte seguro de líquidos a granel, combustibles y químicos.' },
      { nombre: 'Vagón isotank (porta tanque)', desc: 'Transporte intermodal de líquidos a granel en tanques ISO.' },
      { nombre: 'Vagón granelero autodescargable', desc: 'Descarga controlada por compuertas laterales o inferiores.' },
    ],
  },
  {
    id: 'general', titulo: 'TRANSPORTE DE CARGA GENERAL Y MERCADERÍAS',
    desc: 'Para cargas diversas, mercaderías, madera, acero y productos industriales.',
    vagones: [
      { nombre: 'Vagón cerrado (todo puertas)', desc: 'Máxima apertura lateral para cargas paletizadas, bobinas y cargas de alto valor.' },
      { nombre: 'Vagón todo puertas sistema gran apertura', desc: 'Flexibilidad para transportar cargas de distintos tamaños y volúmenes.' },
      { nombre: 'Vagón plataforma (PPA)', desc: 'Transporte de bobinas, contenedores, maquinaria, tubos y cargas pesadas.' },
      { nombre: 'Vagón porta contenedores (PCT)', desc: 'Transporte intermodal de contenedores. Ideal para la logística moderna.' },
      { nombre: 'Vagón porta madera (PRM)', desc: 'Diseñado para el transporte de madera, celulosa y trozas.' },
      { nombre: 'Vagón ganadero', desc: 'Transporte seguro y confortable de hacienda bovina.' },
      { nombre: 'Vagón porta bobinas', desc: 'Transporte seguro de bobinas de acero, aluminio y otros productos.' },
    ],
  },
  {
    id: 'liquidos', titulo: 'LÍQUIDOS Y PRODUCTOS ESPECIALES',
    desc: 'Para el transporte seguro de líquidos, combustibles y productos químicos.',
    vagones: [
      { nombre: 'Vagón tanque combustibles', desc: 'Transporte seguro de combustibles: diésel, naftas y biocombustibles.' },
      { nombre: 'Vagón químico', desc: 'Para productos químicos e industriales con revestimientos especiales.' },
      { nombre: 'Vagón presurizado', desc: 'Transporte de gases licuados y productos bajo presión.' },
      { nombre: 'Vagón silo cementero', desc: 'Diseñado para el transporte de cemento, cal y polvos finos.' },
      { nombre: 'Vagón asfaltero', desc: 'Transporte y distribución de asfalto líquido.' },
      { nombre: 'Vagón de salmuera', desc: 'Para transporte de salmuera y soluciones de alta densidad.' },
    ],
  },
  {
    id: 'servicios', titulo: 'SERVICIOS Y OPERACIONES ESPECIALES',
    desc: 'Vagones diseñados para tareas específicas y mantenimiento de vía.',
    vagones: [
      { nombre: 'Vagón taller', desc: 'Equipado para trabajos de mantenimiento y reparaciones.' },
      { nombre: 'Vagón escorificador', desc: 'Transporte de escorias y materiales a alta temperatura.' },
      { nombre: 'Vagón limpiavías', desc: 'Para limpieza mecanizada de vía y recolección de residuos.' },
      { nombre: 'Vagón porta rieles', desc: 'Transporte seguro y eficiente de rieles largos.' },
    ],
  },
]

export const CAPACIDAD = [
  { v: '+9.700', k: 'vagones fabricados' },
  { v: '+4.000', k: 'vagones reparados o transformados' },
  { v: '30.000 t', k: 'de acero procesadas por año' },
  { v: '+70', k: 'años de experiencia' },
] as const

export const ADAPTACIONES = [
  'Diseños trocha y capacidades.',
  'Adaptaciones estructurales y funcionales.',
  'Sistemas de descarga y apertura especiales.',
  'Pinturas y protecciones según servicio.',
  'Cumplimiento de normas internacionales.',
  'Desarrollos a medida según necesidades operativas.',
] as const

/* ── 3. BOGIE 1676 ────────────────────────────────────────────────
   Cotas de la ficha gráfica S.A.B.B.; componentes de la ET-BOGIE-1676. */
export const BOGIE = {
  titulo: 'Bogie de chapa soldada S.A.B.B.',
  subtitulo: 'Trocha 1676 — con sistema de control de marcha',
  documento: 'ET-BOGIE-1676 — Rev. 00',
  referencia: 'SABB / Buriasco',
  fecha: '23/10/2024',
  normaDiseno: 'AAR (Association of American Railroads)',
  planoFrenos: 'NEFA 576/2',
}

export interface CotaBogie { k: string; v: string; fuente: Fuente }

export const BOGIE_COTAS: CotaBogie[] = [
  { k: 'Trocha', v: '1676 mm', fuente: 'cota' },
  { k: 'Distancia entre ejes', v: '1829 mm', fuente: 'cota' },
  { k: 'Diámetro de rueda', v: '953 mm', fuente: 'cota' },
  { k: 'Ancho total', v: '2839 mm', fuente: 'cota' },
  { k: 'Ancho sobre cajas', v: '2628 mm', fuente: 'cota' },
  { k: 'Largo total', v: '2210 mm', fuente: 'cota' },
  { k: 'Altura placa central', v: '750 mm', fuente: 'cota' },
  { k: 'Carga máxima por eje', v: '20 t', fuente: 'cota' },
  { k: 'Peso (s/NEFA 1241-3)', v: '4400 kg', fuente: 'cota' },
  { k: 'Peso (s/NEFA 156-8)', v: '4100 kg', fuente: 'cota' },
]

export const BOGIE_SISTEMAS = [
  { t: 'Estructura', d: 'Chapa laminada soldada (largueros y traviesas) de acuerdo a normas constructivas y de ensayos según AAR.' },
  { t: 'Caja de grasa', d: 'Manguitos a rodamientos de tapa giratoria, con adaptadores a pedestal estrecho 5½" × 10".' },
  { t: 'Suspensión', d: 'Por resortes helicoidales, cinco exteriores y tres interiores por nido.' },
  { t: 'Amortiguación', d: 'Variable en función de la carga, con sistema de control de marcha con cuña a fricción.' },
  { t: 'Freno', d: 'Mecánico a zapatas (1 para cada rueda) con travesaño de freno tipo UNITED según normas AAR y timonería de chapa de acero.' },
  { t: 'Placa central superior', d: 'De acero fundido, de acuerdo a normas AAR.' },
  { t: 'Par montado', d: 'Ejes FA 8006 FAT V700 — 5½" × 10" según plano NEFA 915-6. Ruedas FA 8005 FAT V701 — R8" según plano NEFA 1241-3 ó NEFA 156-8.' },
  { t: 'Manguito para rodamiento', d: 'Según FAT.MR.1303 de 5½" × 10" (SKF-FAG-NTN-TOYO).' },
  { t: 'Adaptador para manguito', d: 'Según FAT V707 de 5½" × 10".' },
] as const

export const BOGIE_ESPECIFICACIONES = ['AAR — M.202/76-203/78', 'FA - FAT V-1405'] as const

export interface ComponenteBogie {
  n: number; nombre: string; espec: string[]; cantidad: string
}

export const BOGIE_COMPONENTES: ComponenteBogie[] = [
  { n: 1, nombre: 'Resortes exteriores', cantidad: '10',
    espec: ['Diámetro de alambre: 27 mm', 'Diámetro exterior: 140 mm', 'Distribución: 5 unidades por nido'] },
  { n: 2, nombre: 'Resortes interiores', cantidad: '6',
    espec: ['Diámetro de alambre: 17 mm', 'Diámetro exterior: 86 mm', 'Distribución: 3 unidades por nido'] },
  { n: 3, nombre: 'Cuñas a fricción', cantidad: '4',
    espec: ['Control de marcha — Tipo fricción estándar'] },
  { n: 4, nombre: 'Travesaños de freno', cantidad: '2',
    espec: ['Tipo UNIT — Perfiles laminados y soldados, sistema universal', 'Dimensiones según plano NEFA 576/2'] },
  { n: 5, nombre: 'Barra de empuje', cantidad: '1',
    espec: ['Cuerpo tubular ASTM A53, SCH 80', 'Horquilla de acero fundido'] },
  { n: 6, nombre: 'Eslabón de ajuste', cantidad: '1 juego',
    espec: ['Chapa laminada — Palancas vivas y muertas', 'Bujes cementados y templados'] },
  { n: 7, nombre: 'Disco centro de bogie', cantidad: '1', espec: ['—'] },
  { n: 8, nombre: 'Cuñas de retención', cantidad: '4', espec: ['—'] },
]

/** Discrepancia real entre las dos fuentes entregadas. No se resuelve por cuenta propia. */
export const BOGIE_DISCREPANCIA = {
  campo: 'Resorte interior — diámetro exterior',
  a: { valor: '83 mm', fuente: 'Ficha gráfica S.A.B.B.' },
  b: { valor: '86 mm', fuente: 'ET-BOGIE-1676 Rev. 00' },
  nota: 'Las dos fuentes entregadas indican valores distintos. Se muestra el de la especificación técnica y se deja constancia de la diferencia: debe confirmarse con ingeniería antes de cualquier uso productivo.',
}

export const BOGIE_NORMAS_REF = [
  { sigla: 'AAR', d: 'Norma de referencia para diseño, fabricación y ensayo de bogies.' },
  { sigla: 'NEFA 576/2', d: 'Plano de referencia dimensional para travesaños de freno tipo UNIT.' },
  { sigla: 'ASTM A53 SCH 80', d: 'Norma para tubería de acero al carbono — aplicada en barra de empuje.' },
] as const

/* ── 4. CONTENEDOR GRANERO CG35 ──────────────────────────────── */
export const CG35 = {
  titulo: 'Contenedor granero 35 m³',
  plano: 'CG35', conjunto: 'CONTENEDOR', lamina: 'DISPOSICIÓN GENERAL',
  escala: '1:20', trocha: '1000', fecha: '11/03/2022', emision: '2',
  empresa: 'MJ COMERCIAL',
}

export const CG35_COTAS: CotaBogie[] = [
  { k: 'Largo entre cabezales', v: '6000 mm', fuente: 'cota' },
  { k: 'Largo boca de carga', v: '5674 mm', fuente: 'cota' },
  { k: 'Largo total', v: '5853 mm', fuente: 'cota' },
  { k: 'Ancho', v: '2590 mm', fuente: 'cota' },
  { k: 'Ancho entre soleras', v: '3000 mm', fuente: 'cota' },
  { k: 'Ancho en base', v: '2259 mm', fuente: 'cota' },
  { k: 'Altura máxima', v: '2868 mm', fuente: 'cota' },
  { k: 'Altura pasarela', v: '2585 mm', fuente: 'cota' },
  { k: 'Ángulo de tolva', v: '32°', fuente: 'cota' },
  { k: 'Bocas de descarga', v: '3 — a 2160 mm entre ejes', fuente: 'cota' },
]

export const CG35_VARIANTES = [
  { id: 'medida', titulo: 'SOBRE MEDIDA', volumen: '35 m³', carga: '30 t', ancho: '3000 mm (ancho máx)',
    alto: 'POR DEFINIR', nota: 'Aprovecha el gálibo de trocha angosta con 290 mm adicionales por lado respecto del ISO.' },
  { id: 'iso', titulo: 'MEDIDAS ISO', volumen: '30 m³', carga: '25,5 t', ancho: '2430 mm',
    alto: '2400 mm', nota: 'Contenedor ISO 20′ estándar, compatible con equipamiento intermodal existente.' },
] as const

/* ── 5. VAGONES ACOTADOS ──────────────────────────────────────────
   Cotas de la presentación institucional MJ COMERCIAL S.A.
   Cada tipo lleva las medidas que la lámina declara; lo que no figura
   queda fuera y no se completa por analogía. */

export type TipoCaja = 'tolva' | 'cerrado' | 'tanque' | 'gondola' | 'plataforma' | 'borde' | 'granero'

export interface VagonAcotado {
  id: string
  nombre: string
  tipo: TipoCaja
  imagen: string
  desc: string
  trocha: number
  entreCabezales: number
  entreBogies: number
  ancho: number          // ancho máximo de caja
  alto: number           // altura declarada
  volumen?: string
  detalles: string[]
  cotas: { k: string; v: string }[]
}

export const VAGONES_3D: VagonAcotado[] = [
  {
    id: 'tolva-pedrero', nombre: 'Vagón tolva pedrero', tipo: 'tolva', imagen: '/docs/vag-tolva-pedrero.jpg',
    desc: 'Para el transporte de piedra para construcción o balasto para el mantenimiento de la infraestructura ferroviaria.',
    trocha: 1676, entreCabezales: 12470, entreBogies: 9200, ancho: 3140, alto: 3703, volumen: '41 m³',
    detalles: [
      'Apertura de seis compuertas laterales desde la plataforma mediante sistema telescópico.',
      'Tambores de descarga circulares que distribuyen el material fuera o dentro del riel según se requiera.',
    ],
    cotas: [
      { k: 'Entre cabezales', v: '12470 mm' }, { k: 'Entre centro de bogies', v: '9200 mm' },
      { k: 'Ancho máximo de caja', v: '3140 mm' }, { k: 'Altura', v: '3703 mm' },
      { k: 'Trocha', v: '1676 mm' }, { k: 'Volumen útil', v: '41 m³' },
    ],
  },
  {
    id: 'todo-puertas', nombre: 'Vagón todo puertas', tipo: 'cerrado', imagen: '/docs/vag-todo-puertas.jpg',
    desc: 'Transformación de vagón de carga general a vagón todo puertas, sistema de gran apertura, con flexibilidad para transportar cargas de diversos tamaños.',
    trocha: 1676, entreCabezales: 12404, entreBogies: 8840, ancho: 3100, alto: 2896,
    detalles: [
      'Apertura de las cuatro puertas hacia un mismo extremo (apertura máx. 6000 mm).',
      'Apertura simétrica, dos puertas en cada extremo (apertura máx. 5910 mm).',
      'Las cunas porta bobinas pueden cubrirse con tapas desmontables para maximizar la superficie de carga de tres filas de pallets.',
    ],
    cotas: [
      { k: 'Entre cabezales', v: '12404 mm' }, { k: 'Entre centro de bogies', v: '8840 mm' },
      { k: 'Ancho útil', v: '3100 mm' }, { k: 'Altura', v: '2896 mm' },
      { k: 'Espacio para carga', v: '4216 mm' }, { k: 'Trocha', v: '1676 mm' },
      { k: 'Bobinas admitidas', v: 'Ø1300 y Ø1600 mm' },
    ],
  },
  {
    id: 'tanque', nombre: 'Vagón tanque', tipo: 'tanque', imagen: '/docs/vag-tanque.jpg',
    desc: 'Destinado al transporte de productos líquidos. Transporte de hidrocarburos pesados con carga superior de depósito cisterna.',
    trocha: 1435, entreCabezales: 12500, entreBogies: 9250, ancho: 2896, alto: 2522, volumen: '60 m³',
    detalles: ['Carga superior de depósito cisterna.'],
    cotas: [
      { k: 'Entre cabezales', v: '12500 mm' }, { k: 'Entre centro de bogies', v: '9250 mm' },
      { k: 'Ancho', v: '2896 mm' }, { k: 'Altura', v: '2522 mm' },
      { k: 'Trocha', v: '1435 mm' }, { k: 'Volumen útil', v: '60 m³' },
    ],
  },
  {
    id: 'coque', nombre: 'Vagón para coque', tipo: 'gondola', imagen: '/docs/vag-coque.jpg',
    desc: 'Vagón de carga abierto para la industria del petróleo, para el transporte de carbón y coque.',
    trocha: 1676, entreCabezales: 10870, entreBogies: 7620, ancho: 3180, alto: 3100, volumen: '71 m³',
    detalles: [
      'Piso inclinado a dos aguas para permitir el desagote por simple gravedad.',
      'Drenajes laterales para la evacuación de agua y la aireación del material caliente.',
    ],
    cotas: [
      { k: 'Entre cabezales', v: '10870 mm' }, { k: 'Entre centro de bogies', v: '7620 mm' },
      { k: 'Ancho máximo de caja', v: '3180 mm' }, { k: 'Trocha', v: '1676 mm' },
      { k: 'Volumen útil', v: '71 m³' },
    ],
  },
  {
    id: 'portacontenedor', nombre: 'Vagón portacontenedor', tipo: 'plataforma', imagen: '/docs/vag-portacontenedor.jpg',
    desc: 'Plataforma para transporte de contenedores. Facilita la intermodalidad mediante la conexión con camiones y otros medios de transporte.',
    trocha: 1676, entreCabezales: 12416, entreBogies: 9166, ancho: 2850, alto: 1208,
    detalles: [
      'Configuración apta para transporte de un contenedor ISO de 40′.',
      'Configuración apta para transporte de dos contenedores ISO de 20′.',
      'Los contenedores estandarizados pueden ser utilizados a través de diferentes medios de transporte sin descargar y cargar su contenido.',
    ],
    cotas: [
      { k: 'Entre cabezales', v: '12416 mm' }, { k: 'Entre centro de bogies', v: '9166 mm' },
      { k: 'Ancho', v: '2850 mm' }, { k: 'Altura de plataforma', v: '1208 mm' },
      { k: 'Trocha', v: '1676 mm' },
    ],
  },
  {
    id: 'balasto', nombre: 'Vagón para balasto', tipo: 'borde', imagen: '/docs/vag-balasto.jpg',
    desc: 'Transformación de vagón «borde alto» para transporte de balasto con unidades de descarga inferiores, utilizados en trenes de trabajo.',
    trocha: 1676, entreCabezales: 10000, entreBogies: 7000, ancho: 2400, alto: 3100, volumen: '40 m³',
    detalles: [
      'Unidad de descarga de balasto de accionamiento manual con sistema de traba.',
      'Permite volcar un flujo continuo de balasto hacia el interior y/o exterior del riel según se requiera.',
    ],
    cotas: [
      { k: 'Entre cabezales', v: '10000 mm' }, { k: 'Entre centro de bogies', v: '7000 mm' },
      { k: 'Ancho máximo de caja', v: '2400 mm' }, { k: 'Trocha', v: '1676 mm' },
      { k: 'Volumen útil', v: '40 m³' },
    ],
  },
  {
    id: 'granero', nombre: 'Vagón granero', tipo: 'granero', imagen: '/docs/vag-granero.jpg',
    desc: 'Transformación de vagón de carga general para transporte de cereales y harinas con carga superior.',
    trocha: 1676, entreCabezales: 10363, entreBogies: 7165.5, ancho: 3042, alto: 2809, volumen: '77 m³',
    detalles: [
      'Cuatro compuertas de descarga centrales y cuatro boquillas laterales permiten volcar la carga de forma eficiente.',
      'El piso de la bodega se reemplaza por un conjunto de taludes que permiten el correcto desplazamiento del material hacia la zona de descarga.',
    ],
    cotas: [
      { k: 'Entre cabezales', v: '10363 mm' }, { k: 'Entre centro de bogies', v: '7165,5 mm' },
      { k: 'Ancho', v: '3042 mm' }, { k: 'Altura', v: '2809 mm' },
      { k: 'Trocha', v: '1676 mm' }, { k: 'Volumen útil', v: '77 m³' },
    ],
  },
]

/* Trochas de bogie fabricadas */
export const TROCHAS = [
  { mm: 1676, label: 'ANCHA' }, { mm: 1435, label: 'MEDIA' }, { mm: 1000, label: 'ANGOSTA' },
] as const

/* Tipo y cantidad aproximada de vagones fabricados */
export const FABRICADOS = [
  { t: 'Vagón abierto de borde alto', n: 2000 }, { t: 'Vagón tolva para cereales', n: 1775 },
  { t: 'Vagón tolva para piedra', n: 1500 }, { t: 'Vagón tolva especial cubierto', n: 1525 },
  { t: 'Vagón cubierto tipo canadiense', n: 720 }, { t: 'Vagón tanque para aceite', n: 685 },
  { t: 'Vagón ventilado para todo transporte', n: 530 }, { t: 'Vagón para transporte de ganado', n: 500 },
  { t: 'Vagón bastidor completo', n: 110 }, { t: 'Vagón tolva para minerales', n: 95 },
  { t: 'Vagón para transporte de coque', n: 80 }, { t: 'Vagón portacontenedores', n: 45 },
  { t: 'Vagón para transporte de vehículos', n: 25 }, { t: 'Vagón tanque para gas licuado', n: 20 },
] as const

export const PLANTA = [
  { v: '120.000 m²', k: 'superficie total' }, { v: '30.000 m²', k: 'superficie cubierta' },
  { v: '5.000 m', k: 'vías interiores' }, { v: '1.000', k: 'vagones / año' },
] as const
