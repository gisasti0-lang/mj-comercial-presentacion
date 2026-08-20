# Alcaldía Penitenciaria — Sistema Modular de Acero

Presentación arquitectónica interactiva del anteproyecto de MJ Comercial,
construida a partir de la lámina **CONJUNTO / DISPOSICIÓN GENERAL** (escala 1:50,
emisión 1, 20/08/2024) y de la memoria descriptiva del panel institucional.

```bash
npm install
npm run dev      # http://localhost:5178
npm run build
```

## Origen de los datos

El plano se verificó a **escala exacta 1:50** (9000 mm = 510,0 pt) y toda la
geometría del modelo 3D deriva de sus cotas. La interfaz distingue siempre la
procedencia de cada dato:

| Etiqueta | Significado |
|---|---|
| `COTA DE PLANO` | Cota escrita en la lámina |
| `MEDIDO S/ PLANO` | No acotado; medido sobre el dibujo a escala |
| `MEMORIA` | Texto de la memoria descriptiva |
| `POR DEFINIR` | No consta en la documentación entregada |

Cotas verificadas: 9000 × 15000 mm de conjunto · 3000 + 3000 + 3000 transversal ·
3000 celaduría + 12000 celdas · altura máxima 3770 mm (= 3459 de cumbrera sobre
piso + 311 de apoyos) · altura interior 2400 mm · faja de reja superior 500 mm.

## Advertencia sobre instalaciones

**La documentación entregada no incluye planos de instalaciones.** Lo único
documentado son las acometidas de electricidad, agua fría y cloaca en la parte
trasera del módulo, y el punto de `ACCESO PLOMERÍA` del isométrico. El sistema de
capas está operativo, pero **no se dibuja ningún trazado inexistente en el plano**:
desagüe pluvial, agua caliente y ventilación figuran como `POR DEFINIR`.

Tampoco figuran en la planta un comedor ni una oficina de control como locales
independientes: los locales documentados son baño de celaduría, celaduría, duchas,
módulos de celdas y patio/corredor.

## Estructura

- `src/data/project.ts` — fuente de verdad: cotas, niveles, materiales y procedencia
- `src/three/build.ts` — modelo 3D paramétrico por categorías (capas, selección, exploded)
- `src/three/Viewer.tsx` — visor: cámara, cortes, iluminación, raycasting
- `public/docs/` — recortes en alta resolución de la lámina original, **sin modificar**

El modelo se genera proceduralmente desde las cotas en lugar de importar un GLB:
no existe un GLB en la documentación entregada, y así el modelo, la planta
interactiva y el crecimiento modular comparten un único origen de datos.

## Entregable

```bash
npm run entregar
```

Genera **`entrega/Alcaldia-Penitenciaria.html`**: un único archivo de ~4,7 MB con
el modelo 3D, las tipografías y las doce láminas del plano incrustadas. Se abre
con doble click en cualquier computadora — no requiere instalar nada, ni servidor,
ni conexión a internet. Se puede enviar por mail, copiar a un pendrive o subir a
Drive. Verificado en aislamiento: sin una sola referencia externa.

Requiere un navegador con WebGL (Chrome, Edge, Safari o Firefox actuales).
