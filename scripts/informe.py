# -*- coding: utf-8 -*-
"""Informe de desarrollo asistido por agente de IA."""
import fitz

URL  = "https://gisasti0-lang.github.io/mj-comercial-presentacion/"
REPO = "https://github.com/gisasti0-lang/mj-comercial-presentacion"

CSS = """
* { font-family: sans-serif; }
body { color: #1b2025; font-size: 9.5pt; line-height: 1.52; }
h1 { font-size: 23pt; color: #0f1418; margin: 0 0 3pt 0; line-height: 1.14; }
h2 { font-size: 12.5pt; color: #0f1418; margin: 20pt 0 3pt 0;
     border-bottom: 1.4px solid #d96a1c; padding-bottom: 3pt; }
h3 { font-size: 10pt; color: #0f1418; margin: 12pt 0 2pt 0; }
p  { margin: 0 0 6pt 0; }
.sub     { font-size: 10.5pt; color: #566069; margin: 0 0 1pt 0; }
.eyebrow { font-family: monospace; font-size: 7pt; color: #8a939b;
           letter-spacing: 1.6px; margin: 0 0 5pt 0; }
.mono  { font-family: monospace; font-size: 8pt; }
.dato  { font-family: monospace; font-size: 8pt; color: #b8560f; }
.nota  { font-size: 8.2pt; color: #566069; }
.caja  { background: #f2f4f5; padding: 7pt 9pt; margin: 0 0 8pt 0; }
.cajaac{ background: #fcf3e9; padding: 8pt 10pt; margin: 0 0 9pt 0; }
.linea { font-size: 9pt; margin: 0 0 3pt 0; }
.k     { color: #566069; }
table  { width: 100%; font-size: 8.8pt; margin: 0 0 8pt 0; }
th     { text-align: left; color: #8a939b; font-size: 7pt;
         font-family: monospace; letter-spacing: 1.1px;
         border-bottom: 1px solid #ccd2d7; padding: 0 6pt 3pt 0; }
td     { padding: 3.5pt 6pt 3.5pt 0; border-bottom: 1px solid #e6eaec;
         vertical-align: top; }
td.n   { font-family: monospace; font-size: 7.6pt; color: #b8560f; white-space: nowrap; }
td.c   { font-family: monospace; font-size: 11pt; color: #b8560f; white-space: nowrap; }
"""

def f3(a, b, c):
    return f'<tr><td class="n">{a}</td><td><b>{b}</b><br/><span class="nota">{c}</span></td></tr>'

PEDIDOS = [
 ("01","Presentación 3D interactiva de la alcaldía",
  "Brief de 42 puntos. El agente leyó el plano PDF, verificó que estuviera a escala 1:50 exacta y "
  "derivó de ahí toda la geometría."),
 ("02","«Esto necesito que se pueda entregar»",
  "Se empaquetó en un archivo HTML autocontenido que abre con doble click."),
 ("03","«No entiendo cómo enviarlo»",
  "El agente señaló que una aplicación 3D no puede vivir dentro del cuerpo de un correo, y ofreció "
  "las vías que sí funcionan."),
 ("04","Solapa de ferrocarriles con el mismo diseño",
  "Segunda línea de producto reutilizando el sistema visual y de navegación."),
 ("05","3D de los vagones y de los productos",
  "El agente advirtió que no había cotas y propuso tres caminos antes de construir. Al aparecer un "
  "PPTX con las medidas, los modelos pasaron a ser dimensionales."),
 ("06","Cada 3D en su pestaña, sin sección «3D» suelta",
  "Reorganización de la navegación ferroviaria."),
 ("07","Más detalle en duchas, celaduría y baños",
  "Equipamiento de los tres locales del módulo."),
 ("08","Puertas sin obstruir y sanitario en la esquina",
  "El agente volvió al plano, encontró el nicho de acceso de plomería en el tabique y reubicó el "
  "sanitario ahí."),
 ("09","«Hay un solo corte, se necesitan más»",
  "De dos a cuatro cortes, incluido longitudinal y por celaduría."),
 ("10","Modo presentación y cortes en ferroviaria",
  "Recorrido guiado de diez pasos y cortes en los tres modelos."),
 ("11","Publicar por GitHub",
  "Repositorio, integración continua y publicación automática, paso a paso."),
 ("12","«La documentación de ferroviaria no abre bien»",
  "Diagnóstico: rutas absolutas bajo subdirectorio. Afectaba a todo el sitio, no sólo a esa sección."),
]

ERRORES = [
 ("Modelo 3D en blanco",
  "Se movían objetos con attach() durante un recorrido del árbol, lo que mutaba el arreglo de hijos "
  "que se estaba iterando y dejaba huecos.",
  "Recolectar primero, reubicar después."),
 ("Vista en planta en negro",
  "Con la cámara exactamente sobre el objetivo, la dirección de vista queda paralela al vector "
  "«arriba» y la matriz degenera en NaN. Una vez contaminada, no se recuperaba al cambiar de vista.",
  "Inclinación deliberada de pocos grados."),
 ("Ninguna imagen en el sitio publicado",
  "Las rutas absolutas (/docs/…) apuntaban a la raíz del dominio, no al subdirectorio del proyecto.",
  "Resolución contra la base en tiempo de ejecución, conservando el formato que necesita el "
  "empaquetador."),
 ("Primera publicación fallida",
  "El flujo de trabajo corrió con el envío inicial, antes de que Pages estuviera habilitado.",
  "Relanzar una vez activado."),
 ("Página en blanco en el archivo único",
  "Al dejar de ser módulo, el script perdió el diferido implícito y se ejecutaba antes de que "
  "existiera el contenedor raíz.",
  "Emitirlo al final del cuerpo."),
]

HTML = f"""
<p class="eyebrow">MJ COMERCIAL S.A. · MARÍA JUANA, SANTA FE</p>
<h1>Presentación técnica<br/>interactiva</h1>
<p class="sub">Informe de desarrollo asistido por agente de IA</p>
<p class="nota">20 de agosto de 2026</p>

<div class="cajaac">
  <p class="eyebrow" style="margin:0 0 3pt 0">RESULTADO PUBLICADO</p>
  <p class="mono" style="margin:0"><b>{URL}</b></p>
</div>

<h2>1 · Qué se construyó</h2>
<p>Una aplicación web que presenta los dos verticales de negocio de la empresa —material rodante
ferroviario y módulos penitenciarios de acero— con documentación técnica y modelos tridimensionales
navegables, generados a partir de las cotas de los planos.</p>

<table>
<tr><th>Cifra</th><th>Concepto</th></tr>
<tr><td class="c">13</td><td>secciones entre las dos líneas de producto</td></tr>
<tr><td class="c">10</td><td>modelos 3D paramétricos: la alcaldía, el bogie 1676, siete vagones y el contenedor</td></tr>
<tr><td class="c">25</td><td>piezas de catálogo con geometría tridimensional propia</td></tr>
<tr><td class="c">73</td><td>láminas y páginas de documentación</td></tr>
<tr><td class="c">48</td><td>archivos fuente · unas 6.900 líneas</td></tr>
</table>

<h3>Punto de partida</h3>
<p>Los insumos fueron un plano de disposición general en PDF, una ficha técnica de bogie, dos láminas
de catálogo, un catálogo institucional de 36 páginas y una presentación con las cotas de siete
vagones. Ningún modelo 3D previo: toda la geometría se generó por código a partir de esas fuentes.</p>

<h2>2 · El proceso</h2>
<p>El trabajo avanzó por pedidos sucesivos, con correcciones sobre lo ya construido. Ese ida y vuelta
—y no un encargo cerrado de entrada— fue la forma real de trabajo.</p>
<table>
<tr><th>N.º</th><th>Pedido y respuesta</th></tr>
{''.join(f3(a,b,c) for a,b,c in PEDIDOS)}
</table>

<h2>3 · Disciplina sobre los datos</h2>
<p>El encargo incluía una regla explícita: no inventar información que no estuviera en la
documentación. Se implementó como parte del producto, no como una intención.</p>

<h3>Verificación de escala</h3>
<p>Antes de modelar, el agente comprobó que el plano estuviera a escala real: 9000 mm de ancho
equivalen a 510,0 pt en la lámina, exactamente 1:50. Recién con eso confirmado se tomaron medidas
sobre el dibujo para lo que no estaba acotado.</p>

<h3>Procedencia visible</h3>
<p>Cada dato del sitio muestra de dónde sale:</p>
<div class="caja">
<p class="linea"><span class="dato">COTA DE PLANO</span> &nbsp; escrita en la lámina</p>
<p class="linea"><span class="dato">MEDIDO S/ PLANO</span> &nbsp; no acotada; medida sobre el dibujo a escala verificada</p>
<p class="linea"><span class="dato">MEMORIA</span> &nbsp; de la memoria descriptiva</p>
<p class="linea"><span class="dato">POR DEFINIR</span> &nbsp; no consta en la documentación</p>
</div>

<h3>Lo que no se completó</h3>
<p><b>Instalaciones.</b> No hay planos. Sólo constan las acometidas y el acceso de plomería. El sistema
de capas quedó operativo, pero desagüe pluvial, agua caliente y ventilación figuran como
POR DEFINIR en lugar de dibujar trazados inexistentes.</p>
<p><b>Locales del brief que no están en el plano.</b> El encargo pedía comedor y oficina de control;
la planta no los tiene como locales independientes. Se dejó constancia en vez de agregarlos.</p>
<p><b>Piezas representativas.</b> De las 25 del catálogo, 11 tienen geometría acotada y 14 son
representativas de su tipología. Cada tarjeta lo rotula.</p>

<h3>Una contradicción entre fuentes</h3>
<p>El diámetro exterior del resorte interior del bogie aparece como <b>83 mm</b> en la ficha gráfica
S.A.B.B. y <b>86 mm</b> en la especificación ET-BOGIE-1676. El agente no eligió en silencio: muestra el
valor de la especificación y deja la diferencia señalada en pantalla para que la confirme ingeniería.</p>

<h2>4 · Errores encontrados y corregidos</h2>
<p>Los fallos y su diagnóstico son parte del registro, porque muestran dónde se pierde tiempo en un
desarrollo de este tipo.</p>
<table>
<tr><th>Síntoma</th><th>Causa y corrección</th></tr>
{''.join(f'<tr><td class="n">{s}</td><td>{c}<br/><span class="nota"><b>Corrección:</b> {r}</span></td></tr>' for s,c,r in ERRORES)}
</table>
<p class="nota">Ninguno se detectó leyendo el código: todos aparecieron al abrir el sitio en un
navegador y revisar la consola, el estado de la escena y las peticiones de red.</p>

<h2>5 · Decisiones técnicas</h2>
<table>
<tr><th>Decisión</th><th>Motivo</th></tr>
<tr><td class="n">Geometría por código</td><td>No había modelos 3D. Generarla desde las cotas hace que
el modelo y el plano no puedan divergir: cambiar una medida cambia el modelo.</td></tr>
<tr><td class="n">Un solo renderizador<br/>para las miniaturas</td><td>Veinticinco lienzos 3D
simultáneos agotan los contextos gráficos del navegador. Se generan fuera de pantalla y se
almacenan.</td></tr>
<tr><td class="n">Archivo único<br/>autocontenido</td><td>Permite entregar la presentación sin
servidor ni conexión. Requiere incrustar tipografías e imágenes como datos.</td></tr>
<tr><td class="n">Rutas absolutas<br/>en el código</td><td>El empaquetador las necesita como literales
para sustituirlas. La adaptación al subdirectorio se hace al mostrar, no al escribir.</td></tr>
<tr><td class="n">Animaciones de entrada<br/>por CSS</td><td>Si dependieran de JavaScript y éste
fallara, el contenido quedaría invisible de forma permanente.</td></tr>
</table>

<h2>6 · Configuración</h2>
<table>
<tr><th>Concepto</th><th>Detalle</th></tr>
<tr><td class="n">Tecnología</td><td>React 18 · TypeScript · Three.js con React Three Fiber · Vite</td></tr>
<tr><td class="n">Proyecto</td><td class="mono">~/alcaldia-penitenciaria</td></tr>
<tr><td class="n">Repositorio</td><td class="mono">{REPO}</td></tr>
<tr><td class="n">Publicación</td><td>GitHub Pages por GitHub Actions, automática en cada envío</td></tr>
<tr><td class="n">Desarrollo</td><td class="mono">npm run dev → puerto 5178</td></tr>
</table>

<h3>Actualizar el sitio</h3>
<div class="caja">
<p class="mono" style="margin:0">cd ~/alcaldia-penitenciaria</p>
<p class="mono" style="margin:0">git add -A &amp;&amp; git commit -m "cambios" &amp;&amp; git push</p>
</div>
<p class="nota">Se reconstruye y publica solo en unos dos minutos.</p>

<h3>Regenerar el archivo suelto</h3>
<div class="caja"><p class="mono" style="margin:0">npm run entregar</p></div>

<h2>7 · Entregables</h2>
<table>
<tr><th>Formato</th><th>Uso</th></tr>
<tr><td class="n">Sitio web</td><td><span class="mono">{URL}</span><br/>
<span class="nota">Abre directo en el navegador, sin cuenta ni descarga. Pesa 758 KB al abrir; el
resto carga a demanda.</span></td></tr>
<tr><td class="n">Archivo único</td><td><span class="mono">MJ-Comercial-Presentacion.html</span> — 13 MB<br/>
<span class="nota">Funciona sin conexión.</span></td></tr>
<tr><td class="n">Comprimido</td><td><span class="mono">MJ-Comercial-Presentacion.zip</span> — 8,4 MB<br/>
<span class="nota">Para correo; evita los filtros que bloquean archivos HTML.</span></td></tr>
<tr><td class="n">Código</td><td><span class="mono">{REPO}</span></td></tr>
</table>

<h2>8 · Pendientes</h2>
<table>
<tr><th>Prioridad</th><th>Mejora</th></tr>
<tr><td class="n">Alta</td><td><b>Planos de instalaciones</b><br/>
<span class="nota">Es el hueco más grande de la documentación disponible.</span></td></tr>
<tr><td class="n">Alta</td><td><b>Planos de fabricación de vagones</b><br/>
<span class="nota">Hoy se usan cotas generales de catálogo; con los planos los modelos pasarían de
correctos a exactos.</span></td></tr>
<tr><td class="n">Media</td><td><b>Recortar tipografías a alfabeto latino</b><br/>
<span class="nota">La hoja de estilos bajaría de 404 KB a unos 80 KB.</span></td></tr>
<tr><td class="n">Media</td><td><b>Imágenes de las tarjetas de acceso</b><br/>
<span class="nota">Punto observado como flojo; conviene reemplazarlas por vistas de los propios
modelos.</span></td></tr>
</table>
"""

MEDIA  = fitz.paper_rect("a4")
MARGEN = 52
marco  = fitz.Rect(MARGEN, MARGEN, MEDIA.width - MARGEN, MEDIA.height - MARGEN - 16)
SALIDA = "entrega/Informe-desarrollo-agente-IA.pdf"

story  = fitz.Story(html=HTML, user_css=CSS)
writer = fitz.DocumentWriter(SALIDA)
mas = 1
while mas:
    dev = writer.begin_page(MEDIA)
    mas, _ = story.place(marco)
    story.draw(dev)
    writer.end_page()
writer.close()

doc = fitz.open(SALIDA)
for i, pag in enumerate(doc):
    y = MEDIA.height - 40
    pag.draw_line(fitz.Point(MARGEN, y), fitz.Point(MEDIA.width - MARGEN, y),
                  color=(0.85, 0.87, 0.88), width=0.6)
    pag.insert_text(fitz.Point(MARGEN, y + 13),
                    "MJ COMERCIAL - Presentacion tecnica interactiva",
                    fontname="cour", fontsize=7, color=(0.55, 0.59, 0.62))
    pag.insert_text(fitz.Point(MEDIA.width - MARGEN - 34, y + 13),
                    f"{i + 1} / {len(doc)}",
                    fontname="cour", fontsize=7, color=(0.55, 0.59, 0.62))
doc.set_metadata({
    "title": "MJ Comercial - Informe de desarrollo asistido por agente de IA",
    "author": "MJ Comercial S.A.",
    "subject": "Registro de proceso, decisiones tecnicas y resultados",
})
doc.saveIncr()
print(f"{SALIDA} · {len(doc)} páginas")
