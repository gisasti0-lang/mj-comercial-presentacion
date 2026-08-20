export interface Documento {
  id: string; codigo: string; titulo: string; escala: string
  archivo: string | null; categoria: 'PLANOS' | 'CONSTRUCTIVO' | 'INSTALACIONES'
  nota?: string
}

/* Los archivos son recortes en alta resolución de la lámina original.
   Los dibujos NO fueron modificados. */
export const DOCUMENTOS: Documento[] = [
  { id: 'lamina-completa', codigo: 'A-01', titulo: 'DISPOSICIÓN GENERAL — LÁMINA COMPLETA', escala: '1:50', archivo: '/docs/lamina-completa.png', categoria: 'PLANOS' },
  { id: 'planta', codigo: 'A-02', titulo: 'PLANTA — SECCIÓN A-A', escala: '1:50', archivo: '/docs/planta.png', categoria: 'PLANOS' },
  { id: 'seccion-bb', codigo: 'A-03', titulo: 'SECCIÓN B-B', escala: '1:50', archivo: '/docs/seccion-bb.png', categoria: 'PLANOS' },
  { id: 'elev-transversal', codigo: 'A-04', titulo: 'ELEVACIÓN TRANSVERSAL', escala: '1:50', archivo: '/docs/elev-transversal.png', categoria: 'PLANOS' },
  { id: 'elev-longitudinal', codigo: 'A-05', titulo: 'ELEVACIÓN LONGITUDINAL', escala: '1:50', archivo: '/docs/elev-longitudinal.png', categoria: 'PLANOS' },
  { id: 'elev-frontal', codigo: 'A-06', titulo: 'ELEVACIÓN — FRENTE CELADURÍA', escala: '1:50', archivo: '/docs/elev-frontal.png', categoria: 'PLANOS' },
  { id: 'iso-celaduria', codigo: 'A-07', titulo: 'ISOMÉTRICO — INGRESO CELADURÍA / ACCESO PLOMERÍA', escala: '—', archivo: '/docs/iso-celaduria.jpg', categoria: 'PLANOS' },
  { id: 'iso-porton', codigo: 'A-08', titulo: 'ISOMÉTRICO — PORTÓN FINAL PATIO/CORREDOR', escala: '—', archivo: '/docs/iso-porton.jpg', categoria: 'PLANOS' },

  { id: 'det-muros', codigo: 'D-01', titulo: 'DETALLE CONSTRUCTIVO — MUROS', escala: '1:10', archivo: '/docs/det-muros.png', categoria: 'CONSTRUCTIVO' },
  { id: 'det-pisos', codigo: 'D-02', titulo: 'DETALLE CONSTRUCTIVO — PISOS', escala: '1:10', archivo: '/docs/det-pisos.png', categoria: 'CONSTRUCTIVO' },
  { id: 'det-techo', codigo: 'D-03', titulo: 'DETALLE CONSTRUCTIVO — TECHO', escala: '1:10', archivo: '/docs/det-techo.png', categoria: 'CONSTRUCTIVO' },
  { id: 'det-uniones', codigo: 'D-04', titulo: 'DETALLE — UNIONES ENTRE MÓDULOS', escala: 'POR DEFINIR', archivo: null, categoria: 'CONSTRUCTIVO',
    nota: 'No incluido en la documentación entregada.' },

  { id: 'inst-planta', codigo: 'I-01', titulo: 'INSTALACIONES — PLANTA GENERAL', escala: 'POR DEFINIR', archivo: null, categoria: 'INSTALACIONES',
    nota: 'No incluido en la documentación entregada.' },
  { id: 'inst-cortes', codigo: 'I-02', titulo: 'INSTALACIONES — CORTES', escala: 'POR DEFINIR', archivo: null, categoria: 'INSTALACIONES',
    nota: 'No incluido en la documentación entregada.' },
  { id: 'inst-detalles', codigo: 'I-03', titulo: 'INSTALACIONES — DETALLES', escala: 'POR DEFINIR', archivo: null, categoria: 'INSTALACIONES',
    nota: 'No incluido en la documentación entregada.' },
  { id: 'inst-iso', codigo: 'I-04', titulo: 'INSTALACIONES — ISOMÉTRICO', escala: 'POR DEFINIR', archivo: null, categoria: 'INSTALACIONES',
    nota: 'No incluido en la documentación entregada.' },

  { id: 'rotulo', codigo: '—', titulo: 'RÓTULO DE LA LÁMINA', escala: '—', archivo: '/docs/rotulo.png', categoria: 'PLANOS' },
]

export const docPorId = (id: string): Documento | null => {
  const d = DOCUMENTOS.find((x) => x.id === id)
  if (d) return d
  const f = DOCS_FERRO.find((x) => x.id === id)
  if (f) return { ...f, categoria: 'PLANOS' as const }
  const c = CATALOGOS_LAMINA.find((x) => x.id === id)
  if (c) return { ...c, categoria: 'PLANOS' as const }
  const pg = CATALOGO_PAGINAS.find((x) => x.id === id)
  return pg ? { ...pg, categoria: 'PLANOS' as const } : null
}

/* Catálogo institucional — 36 páginas del PDF de la empresa.
   Las rutas van escritas una por una: el empaquetador del entregable
   busca cada ruta como literal para incrustar la imagen. */
export const CATALOGO_PAGINAS = [
  { id: 'cat-p1', codigo: '1 / 36', titulo: 'Catálogo institucional MJ Comercial — página 1', escala: '—', archivo: '/docs/catalogo/p01.jpg' },
  { id: 'cat-p2', codigo: '2 / 36', titulo: 'Catálogo institucional MJ Comercial — página 2', escala: '—', archivo: '/docs/catalogo/p02.jpg' },
  { id: 'cat-p3', codigo: '3 / 36', titulo: 'Catálogo institucional MJ Comercial — página 3', escala: '—', archivo: '/docs/catalogo/p03.jpg' },
  { id: 'cat-p4', codigo: '4 / 36', titulo: 'Catálogo institucional MJ Comercial — página 4', escala: '—', archivo: '/docs/catalogo/p04.jpg' },
  { id: 'cat-p5', codigo: '5 / 36', titulo: 'Catálogo institucional MJ Comercial — página 5', escala: '—', archivo: '/docs/catalogo/p05.jpg' },
  { id: 'cat-p6', codigo: '6 / 36', titulo: 'Catálogo institucional MJ Comercial — página 6', escala: '—', archivo: '/docs/catalogo/p06.jpg' },
  { id: 'cat-p7', codigo: '7 / 36', titulo: 'Catálogo institucional MJ Comercial — página 7', escala: '—', archivo: '/docs/catalogo/p07.jpg' },
  { id: 'cat-p8', codigo: '8 / 36', titulo: 'Catálogo institucional MJ Comercial — página 8', escala: '—', archivo: '/docs/catalogo/p08.jpg' },
  { id: 'cat-p9', codigo: '9 / 36', titulo: 'Catálogo institucional MJ Comercial — página 9', escala: '—', archivo: '/docs/catalogo/p09.jpg' },
  { id: 'cat-p10', codigo: '10 / 36', titulo: 'Catálogo institucional MJ Comercial — página 10', escala: '—', archivo: '/docs/catalogo/p10.jpg' },
  { id: 'cat-p11', codigo: '11 / 36', titulo: 'Catálogo institucional MJ Comercial — página 11', escala: '—', archivo: '/docs/catalogo/p11.jpg' },
  { id: 'cat-p12', codigo: '12 / 36', titulo: 'Catálogo institucional MJ Comercial — página 12', escala: '—', archivo: '/docs/catalogo/p12.jpg' },
  { id: 'cat-p13', codigo: '13 / 36', titulo: 'Catálogo institucional MJ Comercial — página 13', escala: '—', archivo: '/docs/catalogo/p13.jpg' },
  { id: 'cat-p14', codigo: '14 / 36', titulo: 'Catálogo institucional MJ Comercial — página 14', escala: '—', archivo: '/docs/catalogo/p14.jpg' },
  { id: 'cat-p15', codigo: '15 / 36', titulo: 'Catálogo institucional MJ Comercial — página 15', escala: '—', archivo: '/docs/catalogo/p15.jpg' },
  { id: 'cat-p16', codigo: '16 / 36', titulo: 'Catálogo institucional MJ Comercial — página 16', escala: '—', archivo: '/docs/catalogo/p16.jpg' },
  { id: 'cat-p17', codigo: '17 / 36', titulo: 'Catálogo institucional MJ Comercial — página 17', escala: '—', archivo: '/docs/catalogo/p17.jpg' },
  { id: 'cat-p18', codigo: '18 / 36', titulo: 'Catálogo institucional MJ Comercial — página 18', escala: '—', archivo: '/docs/catalogo/p18.jpg' },
  { id: 'cat-p19', codigo: '19 / 36', titulo: 'Catálogo institucional MJ Comercial — página 19', escala: '—', archivo: '/docs/catalogo/p19.jpg' },
  { id: 'cat-p20', codigo: '20 / 36', titulo: 'Catálogo institucional MJ Comercial — página 20', escala: '—', archivo: '/docs/catalogo/p20.jpg' },
  { id: 'cat-p21', codigo: '21 / 36', titulo: 'Catálogo institucional MJ Comercial — página 21', escala: '—', archivo: '/docs/catalogo/p21.jpg' },
  { id: 'cat-p22', codigo: '22 / 36', titulo: 'Catálogo institucional MJ Comercial — página 22', escala: '—', archivo: '/docs/catalogo/p22.jpg' },
  { id: 'cat-p23', codigo: '23 / 36', titulo: 'Catálogo institucional MJ Comercial — página 23', escala: '—', archivo: '/docs/catalogo/p23.jpg' },
  { id: 'cat-p24', codigo: '24 / 36', titulo: 'Catálogo institucional MJ Comercial — página 24', escala: '—', archivo: '/docs/catalogo/p24.jpg' },
  { id: 'cat-p25', codigo: '25 / 36', titulo: 'Catálogo institucional MJ Comercial — página 25', escala: '—', archivo: '/docs/catalogo/p25.jpg' },
  { id: 'cat-p26', codigo: '26 / 36', titulo: 'Catálogo institucional MJ Comercial — página 26', escala: '—', archivo: '/docs/catalogo/p26.jpg' },
  { id: 'cat-p27', codigo: '27 / 36', titulo: 'Catálogo institucional MJ Comercial — página 27', escala: '—', archivo: '/docs/catalogo/p27.jpg' },
  { id: 'cat-p28', codigo: '28 / 36', titulo: 'Catálogo institucional MJ Comercial — página 28', escala: '—', archivo: '/docs/catalogo/p28.jpg' },
  { id: 'cat-p29', codigo: '29 / 36', titulo: 'Catálogo institucional MJ Comercial — página 29', escala: '—', archivo: '/docs/catalogo/p29.jpg' },
  { id: 'cat-p30', codigo: '30 / 36', titulo: 'Catálogo institucional MJ Comercial — página 30', escala: '—', archivo: '/docs/catalogo/p30.jpg' },
  { id: 'cat-p31', codigo: '31 / 36', titulo: 'Catálogo institucional MJ Comercial — página 31', escala: '—', archivo: '/docs/catalogo/p31.jpg' },
  { id: 'cat-p32', codigo: '32 / 36', titulo: 'Catálogo institucional MJ Comercial — página 32', escala: '—', archivo: '/docs/catalogo/p32.jpg' },
  { id: 'cat-p33', codigo: '33 / 36', titulo: 'Catálogo institucional MJ Comercial — página 33', escala: '—', archivo: '/docs/catalogo/p33.jpg' },
  { id: 'cat-p34', codigo: '34 / 36', titulo: 'Catálogo institucional MJ Comercial — página 34', escala: '—', archivo: '/docs/catalogo/p34.jpg' },
  { id: 'cat-p35', codigo: '35 / 36', titulo: 'Catálogo institucional MJ Comercial — página 35', escala: '—', archivo: '/docs/catalogo/p35.jpg' },
  { id: 'cat-p36', codigo: '36 / 36', titulo: 'Catálogo institucional MJ Comercial — página 36', escala: '—', archivo: '/docs/catalogo/p36.jpg' },
] as const

/* Láminas de catálogo por línea de producto */
export const CATALOGOS_LAMINA = [
  { id: 'cat-vagones', codigo: 'CAT-V', titulo: 'CATÁLOGO DE VAGONES DE CARGA', escala: '—', archivo: '/docs/cat-vagones.jpg' },
  { id: 'cat-repuestos', codigo: 'CAT-R', titulo: 'CATÁLOGO DE COMPONENTES Y REPUESTOS FERROVIARIOS', escala: '—', archivo: '/docs/cat-repuestos.jpg' },
] as const

export const SECCIONES_FERRO = [
  { n: '01', id: 'vagones', label: 'VAGONES' },
  { n: '02', id: 'componentes', label: 'COMPONENTES' },
  { n: '03', id: 'bogie', label: 'BOGIE 1676' },
  { n: '04', id: 'contenedor', label: 'CONTENEDOR' },
  { n: '05', id: 'docferro', label: 'DOCUMENTACIÓN' },
] as const

export const DOCS_FERRO = [
  { id: 'cg35-lamina', codigo: 'CG35', titulo: 'CONTENEDOR GRANERO 35 m³ — DISPOSICIÓN GENERAL', escala: '1:20', archivo: '/docs/cg35-lamina.png' },
  { id: 'cg35-elev-lat', codigo: 'CG35-1', titulo: 'ELEVACIÓN LATERAL', escala: '1:20', archivo: '/docs/cg35-elev-lat.png' },
  { id: 'cg35-elev-front', codigo: 'CG35-2', titulo: 'ELEVACIÓN FRONTAL', escala: '1:20', archivo: '/docs/cg35-elev-front.png' },
  { id: 'cg35-corte-aa', codigo: 'CG35-3', titulo: 'SECCIÓN A-A', escala: '1:20', archivo: '/docs/cg35-corte-aa.png' },
  { id: 'cg35-corte-bb', codigo: 'CG35-4', titulo: 'SECCIÓN B-B', escala: '1:20', archivo: '/docs/cg35-corte-bb.png' },
  { id: 'cg35-planta', codigo: 'CG35-5', titulo: 'PLANTA', escala: '1:20', archivo: '/docs/cg35-planta.png' },
  { id: 'cg35-galibo', codigo: 'CG-G', titulo: 'COMPARATIVO DE GÁLIBO — SOBRE MEDIDA / ISO', escala: '—', archivo: '/docs/cg35-galibo.jpg' },
  { id: 'cg35-rotulo', codigo: '—', titulo: 'RÓTULO DE LA LÁMINA', escala: '—', archivo: '/docs/cg35-rotulo.png' },
] as const

export const SECCIONES = [
  { n: '01', id: 'concepto', label: 'CONCEPTO' },
  { n: '02', id: 'sistema', label: 'SISTEMA' },
  { n: '03', id: 'conjunto', label: 'CONJUNTO' },
  { n: '04', id: 'modulos', label: 'MÓDULOS' },
  { n: '05', id: 'instalaciones', label: 'INSTALACIONES' },
  { n: '06', id: 'detalles', label: 'DETALLES' },
  { n: '07', id: 'modelo', label: '3D' },
  { n: '08', id: 'documentacion', label: 'DOCUMENTACIÓN' },
] as const
