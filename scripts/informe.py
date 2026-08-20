# -*- coding: utf-8 -*-
"""Genera el informe de entrega en PDF."""
import fitz

URL = "https://gisasti0-lang.github.io/mj-comercial-presentacion/"
REPO = "https://github.com/gisasti0-lang/mj-comercial-presentacion"

CSS = """
* { font-family: sans-serif; }
body { color: #1c2126; font-size: 10pt; line-height: 1.5; }
h1 { font-size: 25pt; color: #0f1418; margin: 0 0 4pt 0; line-height: 1.12; }
h2 { font-size: 13pt; color: #0f1418; margin: 22pt 0 3pt 0;
     border-bottom: 1.4px solid #d96a1c; padding-bottom: 3pt; }
h3 { font-size: 10.5pt; color: #0f1418; margin: 13pt 0 2pt 0; }
p  { margin: 0 0 7pt 0; }
.sub   { font-size: 11pt; color: #5a646d; margin: 0 0 2pt 0; }
.eyebrow { font-family: monospace; font-size: 7.5pt; color: #8a939b;
           letter-spacing: 1.6px; margin: 0 0 5pt 0; }
.acento { color: #b8560f; }
.mono  { font-family: monospace; font-size: 8.5pt; }
.dato  { font-family: monospace; font-size: 8.5pt; color: #b8560f; }
.nota  { font-size: 8.5pt; color: #5a646d; }
.caja  { background: #f2f4f5; padding: 8pt 10pt; margin: 0 0 9pt 0; }
.cajaac{ background: #fcf3e9; padding: 8pt 10pt; margin: 0 0 9pt 0; }
.linea { font-size: 9.5pt; margin: 0 0 3.5pt 0; }
.k     { color: #5a646d; }
table  { width: 100%; font-size: 9pt; margin: 0 0 9pt 0; }
th     { text-align: left; color: #8a939b; font-size: 7.5pt;
         font-family: monospace; letter-spacing: 1.2px;
         border-bottom: 1px solid #ccd2d7; padding: 0 6pt 3pt 0; }
td     { padding: 4pt 6pt 4pt 0; border-bottom: 1px solid #e6eaec;
         vertical-align: top; }
td.n   { font-family: monospace; font-size: 8pt; color: #b8560f;
         white-space: nowrap; }
"""

def fila(n, t, d):
    return f'<tr><td class="n">{n}</td><td><b>{t}</b><br/><span class="nota">{d}</span></td></tr>'

PEDIDOS = [
    ("01", "Presentación 3D interactiva de la alcaldía",
     "Brief de 42 puntos: estética de estudio de arquitectura, siete secciones, modelo 3D navegable, "
     "capas, cortes, exploded view y vínculo entre modelo y documentación. Regla central: no inventar "
     "datos que no figuren en el plano."),
    ("02", "«Esto necesito que se pueda entregar»",
     "Se empaquetó todo en un archivo HTML autocontenido que abre con doble click, sin instalar nada "
     "ni conexión."),
    ("03", "«No entiendo cómo enviarlo» / «quiero compartirlo»",
     "Se generó una versión comprimida para correo y se publicó como página web con enlace propio."),
    ("04", "Solapa de ferrocarriles con el mismo diseño",
     "Segunda línea de producto con idéntico lenguaje visual: vagones, componentes, bogie y contenedor."),
    ("05", "3D de los vagones y de los productos",
     "Siete vagones modelados con cotas reales y las 25 piezas del catálogo con su imagen tridimensional."),
    ("06", "Cada 3D en su pestaña, sin sección «3D» suelta",
     "Se reorganizó la navegación ferroviaria: el modelo vive dentro de la pestaña de cada producto."),
    ("07", "Más detalle en duchas, celaduría y baños",
     "Se incorporó el equipamiento de los tres locales del módulo de celaduría."),
    ("08", "Puertas sin obstruir y sanitario en la esquina",
     "Se reubicaron artefactos y vanos: el sanitario de cada celda pasó a la esquina contra el tabique, "
     "donde el plano ubica el acceso de plomería."),
    ("09", "Un solo corte, se necesitan más",
     "De dos cortes se pasó a cuatro, incluido uno longitudinal y otro por celaduría."),
    ("10", "Modo presentación y cortes en ferroviaria",
     "Recorrido guiado de diez pasos y cortes en los tres modelos ferroviarios."),
    ("11", "Publicar por GitHub",
     "Repositorio, integración continua y publicación automática."),
    ("12", "La documentación de ferroviaria no abre bien",
     "Se corrigió la resolución de rutas bajo subdirectorio, que rompía todas las láminas del sitio."),
]

ALCALDIA = [
    ("01", "Concepto", "Idea del sistema y memoria descriptiva"),
    ("02", "Sistema modular", "Ensamblaje de la unidad mínima y crecimiento longitudinal"),
    ("03", "Conjunto", "Modelo 3D, planta interactiva y cortes"),
    ("04", "Módulos", "Celaduría, celdas, patio/corredor, baño y duchas"),
    ("05", "Instalaciones", "Capas sobre la arquitectura"),
    ("06", "Detalles", "Muros, pisos y techo a escala 1:10"),
    ("07", "3D", "Visor completo con capas, cortes y despiece"),
    ("08", "Documentación", "Láminas originales en alta resolución"),
]

FERRO = [
    ("01", "Vagones", "Siete tipos acotados en 3D, con selector"),
    ("02", "Componentes", "25 piezas con imagen tridimensional y criticidad"),
    ("03", "Bogie 1676", "Modelo 3D y ficha técnica"),
    ("04", "Contenedor", "CG35 en 3D y cotas del plano"),
    ("05", "Documentación", "Catálogo institucional, de vagones y de repuestos"),
]

HTML = f"""
<p class="eyebrow">MJ COMERCIAL S.A.</p>
<h1>Presentación técnica<br/>interactiva</h1>
<p class="sub">Informe de entrega</p>
<p class="nota">20 de agosto de 2026</p>

<div class="cajaac">
  <p class="eyebrow" style="margin:0 0 3pt 0">SITIO PUBLICADO</p>
  <p class="mono acento" style="margin:0"><b>{URL}</b></p>
  <p class="nota" style="margin:4pt 0 0 0">Abre en cualquier navegador, sin cuenta ni descarga.</p>
</div>

<h2>1 · Qué se pidió</h2>
<p>Los pedidos, en el orden en que fueron surgiendo durante el trabajo.</p>
<table>
<tr><th>N.º</th><th>Pedido y resolución</th></tr>
{''.join(fila(n,t,d) for n,t,d in PEDIDOS)}
</table>

<h2>2 · Qué se construyó</h2>
<p>Una sola aplicación con dos líneas de producto, que comparten diseño, navegación y criterio de datos.</p>

<h3>Línea Alcaldía Penitenciaria</h3>
<table>
<tr><th>N.º</th><th>Sección</th></tr>
{''.join(fila(n,t,d) for n,t,d in ALCALDIA)}
</table>

<h3>Línea Ferroviaria</h3>
<table>
<tr><th>N.º</th><th>Sección</th></tr>
{''.join(fila(n,t,d) for n,t,d in FERRO)}
</table>

<h3>Modelos tridimensionales</h3>
<div class="caja">
<p class="linea"><span class="k">Alcaldía —</span> conjunto completo, paramétrico según las cotas del
plano, con crecimiento de 1 a 4 tramos.</p>
<p class="linea"><span class="k">Bogie 1676 —</span> trocha 1676, entre ejes 1829, rueda Ø953,
nidos de 5 resortes exteriores y 3 interiores.</p>
<p class="linea"><span class="k">Siete vagones —</span> cada uno con sus cotas declaradas, montando
el bogie 1676 a la separación indicada.</p>
<p class="linea"><span class="k">Contenedor CG35 —</span> 6000 × 2590 × 2868 mm, tolvas a 32°,
tres bocas de descarga.</p>
<p class="linea"><span class="k">25 piezas de catálogo —</span> imagen tridimensional propia.</p>
<p class="linea" style="margin-top:6pt"><span class="k">Cada modelo permite:</span> rotar y acercar,
encender y apagar capas, cortar por tres ejes, despiezar y seleccionar piezas para ver su
especificación.</p>
</div>

<h2>3 · Criterio sobre los datos</h2>
<p>Toda la geometría deriva de la documentación entregada. La lámina de la alcaldía se verificó a
escala exacta 1:50 —9000 mm equivalen a 510,0 pt— y las cotas del modelo se contrastaron contra
el dibujo.</p>
<p>Cada dato muestra su procedencia:</p>
<div class="caja">
<p class="linea"><span class="dato">COTA DE PLANO</span> &nbsp; escrita en la lámina</p>
<p class="linea"><span class="dato">MEDIDO S/ PLANO</span> &nbsp; no acotada; medida sobre el dibujo a escala</p>
<p class="linea"><span class="dato">MEMORIA</span> &nbsp; de la memoria descriptiva</p>
<p class="linea"><span class="dato">POR DEFINIR</span> &nbsp; no consta en la documentación</p>
</div>

<h3>Lo que quedó sin definir</h3>
<p><b>Instalaciones de la alcaldía.</b> La documentación no incluye planos de instalaciones. Sólo constan
las acometidas de electricidad, agua fría y cloaca en la parte trasera, y el acceso de plomería del
isométrico. El sistema de capas está operativo pero no dibuja trazados inexistentes: desagüe pluvial,
agua caliente y ventilación figuran como POR DEFINIR.</p>
<p><b>Locales no presentes.</b> La planta indica baño de celaduría, celaduría, duchas, módulos de celdas
y patio/corredor. No figuran comedor ni oficina de control como locales independientes.</p>
<p><b>Discrepancia entre fuentes.</b> El diámetro exterior del resorte interior del bogie aparece como
83 mm en la ficha gráfica S.A.B.B. y 86 mm en la especificación ET-BOGIE-1676. Se muestra el valor de
la especificación y la diferencia queda señalada para que la confirme ingeniería.</p>
<p><b>Piezas representativas.</b> De las 25 del catálogo, 11 tienen geometría acotada y 14 son
representativas de la tipología. Cada tarjeta lo indica.</p>

<h2>4 · Configuración técnica</h2>
<table>
<tr><th>Concepto</th><th>Detalle</th></tr>
<tr><td class="n">Tecnología</td><td>React 18 · TypeScript · Three.js con React Three Fiber · Vite</td></tr>
<tr><td class="n">Proyecto</td><td class="mono">~/alcaldia-penitenciaria</td></tr>
<tr><td class="n">Repositorio</td><td class="mono">{REPO}</td></tr>
<tr><td class="n">Cuenta</td><td>gisasti0-lang &nbsp;<span class="nota">(distinta de gisasti1, donde están otros proyectos)</span></td></tr>
<tr><td class="n">Publicación</td><td>GitHub Pages mediante GitHub Actions, automática en cada envío a la rama principal</td></tr>
<tr><td class="n">Servidor local</td><td class="mono">npm run dev &nbsp;→&nbsp; puerto 5178</td></tr>
</table>

<h3>Cómo actualizar el sitio</h3>
<div class="caja">
<p class="mono" style="margin:0">cd ~/alcaldia-penitenciaria</p>
<p class="mono" style="margin:0">git add -A &amp;&amp; git commit -m "cambios" &amp;&amp; git push</p>
</div>
<p class="nota">El sitio se reconstruye y publica solo en unos dos minutos.</p>

<h3>Cómo regenerar el archivo suelto</h3>
<div class="caja">
<p class="mono" style="margin:0">npm run entregar</p>
</div>
<p class="nota">Produce un HTML único con el modelo 3D, las tipografías y las 65 láminas incrustadas.
Se abre con doble click, sin servidor ni conexión.</p>

<h2>5 · Entregables</h2>
<table>
<tr><th>Formato</th><th>Uso</th></tr>
<tr><td class="n">Sitio web</td><td><span class="mono">{URL}</span><br/>
<span class="nota">Para mandar por correo. Abre directo, sin descargar.</span></td></tr>
<tr><td class="n">Archivo único</td><td><span class="mono">entrega/MJ-Comercial-Presentacion.html</span> — 12 MB<br/>
<span class="nota">Funciona sin conexión. Para pendrive o presentación sin internet.</span></td></tr>
<tr><td class="n">Comprimido</td><td><span class="mono">entrega/MJ-Comercial-Presentacion.zip</span> — 8 MB<br/>
<span class="nota">Para adjuntar en correo; evita los filtros que bloquean archivos HTML.</span></td></tr>
<tr><td class="n">Código</td><td><span class="mono">{REPO}</span></td></tr>
</table>

<h2>6 · Pendientes</h2>
<p>Nada bloquea la presentación del proyecto. Lo que sigue son mejoras posibles.</p>
<table>
<tr><th>Prioridad</th><th>Mejora</th></tr>
<tr><td class="n">Alta</td><td><b>Planos de instalaciones de la alcaldía</b><br/>
<span class="nota">Es el hueco más grande. Con los planos de cloacal, agua y ventilación, esa sección se completa.</span></td></tr>
<tr><td class="n">Alta</td><td><b>Planos de fabricación de los vagones</b><br/>
<span class="nota">Hoy se usan las cotas generales del catálogo. Con los planos, los modelos pasarían de correctos a exactos.</span></td></tr>
<tr><td class="n">Media</td><td><b>Recortar tipografías a alfabeto latino</b><br/>
<span class="nota">La hoja de estilos bajaría de 404 KB a unos 80 KB y el sitio abriría más rápido.</span></td></tr>
<tr><td class="n">Baja</td><td><b>Dominio propio</b><br/>
<span class="nota">En lugar de la dirección de github.io, si se envía a clientes con frecuencia.</span></td></tr>
</table>
"""

ANCHO, ALTO = fitz.paper_size("a4")
HOJA = fitz.Rect(0, 0, ANCHO, ALTO)
MARGEN = 52
marco = fitz.Rect(MARGEN, MARGEN, ANCHO - MARGEN, ALTO - MARGEN - 16)

story = fitz.Story(html=HTML, user_css=CSS)
writer = fitz.DocumentWriter("entrega/Informe-de-entrega.pdf")
paginas = 0
mas = 1
while mas:
    dispositivo = writer.begin_page(HOJA)
    mas, _ = story.place(marco)
    story.draw(dispositivo)
    writer.end_page()
    paginas += 1
writer.close()

# pie de página con numeración
doc = fitz.open("entrega/Informe-de-entrega.pdf")
for i, pagina in enumerate(doc):
    pagina.draw_line(fitz.Point(MARGEN, ALTO - 44), fitz.Point(ANCHO - MARGEN, ALTO - 44),
                     color=(0.85, 0.87, 0.88), width=0.6)
    pagina.insert_text(fitz.Point(MARGEN, ALTO - 32),
                       "MJ COMERCIAL · Presentación técnica interactiva",
                       fontname="cour", fontsize=7, color=(0.55, 0.59, 0.62))
    pagina.insert_text(fitz.Point(ANCHO - MARGEN - 40, ALTO - 32),
                       f"{i + 1} / {len(doc)}",
                       fontname="cour", fontsize=7, color=(0.55, 0.59, 0.62))
doc.set_metadata({
    "title": "MJ Comercial — Presentación técnica interactiva · Informe de entrega",
    "author": "MJ Comercial S.A.",
    "subject": "Informe de entrega: pedidos, configuración y enlaces",
})
doc.saveIncr()
print(f"Informe-de-entrega.pdf · {paginas} páginas")
