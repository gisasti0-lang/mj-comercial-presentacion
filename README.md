# Presentación técnica interactiva — MJ Comercial S.A.

Sitio web que presenta los dos verticales de una fábrica argentina de vagones
ferroviarios y módulos penitenciarios de acero, con modelos 3D navegables
generados a partir de las cotas de los planos.

**Sitio funcionando:** https://gisasti0-lang.github.io/mj-comercial-presentacion/

---

## Qué construí

Una aplicación web con dos líneas de producto:

- **Ferroviario** — siete tipos de vagón modelados en 3D con sus cotas reales,
  catálogo de 25 componentes, bogie de trocha 1676 y contenedor granero.
- **Cárceles** — anteproyecto de módulos penitenciarios: modelo 3D del conjunto,
  planta interactiva, cortes, despiece e instalaciones por capas.

Cada modelo se puede rotar, cortar, despiezar, y al hacer click en una pieza
aparece su especificación técnica y de qué plano sale.

No partí de ningún modelo 3D. **Toda la geometría se genera por código a partir
de los planos**: un PDF de disposición general, una ficha técnica de bogie y un
catálogo institucional de 36 páginas.

---

## El proceso: cómo se lo pedí y cómo iteré

No fue un encargo cerrado. Fue una conversación de idas y vueltas donde cada
resultado me hacía pedir lo siguiente.

### 1. El pedido inicial

Arranqué con un brief largo —42 puntos— describiendo la estética, las secciones
y el comportamiento del 3D. Incluí una regla que resultó ser la más importante
de todo el trabajo:

> Si el plano dice un dato, usar ese dato. Si no lo dice: **NO INVENTARLO**.

Lo primero que hizo el agente fue leer el PDF y **verificar que estuviera a
escala real**: comprobó que 9000 mm del plano equivalen a 510,0 pt en la lámina,
exactamente 1:50. Recién con eso confirmado empezó a medir sobre el dibujo lo
que no estaba acotado.

Eso no se lo pedí. Lo hizo porque sin esa verificación, medir sobre el plano no
significa nada.

### 2. «Esto necesito que se pueda entregar»

Tenía algo andando pero solo en mi máquina. Le dije que necesitaba entregarlo y
armó un archivo HTML único, con todo adentro, que abre con doble click.

### 3. «No entiendo cómo enviarlo»

Acá el agente me frenó con algo que yo no sabía: **una aplicación 3D no puede
ir pegada dentro del cuerpo de un mail**, porque Gmail y Outlook borran el
JavaScript. En vez de hacerme perder tiempo, me explicó qué sí funciona.

También fue donde **se fue por las ramas**: se puso a construir un botón para
exportar imágenes que yo no había pedido. Lo corté con un «espera.» y volvimos
al tema.

### 4. Agregar la línea ferroviaria

Le pedí una solapa de ferrocarriles con el mismo diseño. La armó reutilizando
todo el sistema visual.

### 5. El 3D de los vagones

Le pedí modelar los vagones. Acá pasó lo más interesante: **el agente se negó a
hacerlo a ojo**. Me dijo que no tenía ninguna cota de los vagones y que
inventarlas sería romper la regla que yo mismo había puesto. Me ofreció tres
caminos y me hizo elegir.

Entonces le pasé un PowerPoint institucional. Ahí encontró las cotas reales de
**siete vagones** —12470 mm entre cabezales, 3140 de ancho, 41 m³— y recién ahí
los modeló de verdad.

**La lección:** el agente no estaba trabado por incapacidad, estaba trabado por
falta de información. Cuando le di la fuente, el resultado cambió de categoría.

### 6. Correcciones sobre lo construido

A partir de acá casi todo fue corregir mirando el resultado:

- *«Configurá que las puertas no queden tapadas por muebles o que entres a una
  ducha, y que las celdas tengan su baño en una esquina como figura en los
  mapas»* → el agente volvió al plano, encontró el nicho de acceso de plomería
  en el tabique entre celdas y reubicó los sanitarios ahí.
- *«Hay un solo corte, se necesitan más»* → pasó de dos a cuatro.
- *«La documentación de ferroviaria no abre bien»* → era un error de rutas que
  afectaba a todo el sitio publicado, no solo a esa sección.
- *«No me gusta»* sobre las imágenes de la portada → quedó pendiente.

---

## Qué hace el agente y por qué

### Genera la geometría desde las cotas, no a mano

El modelo 3D no está dibujado: está **calculado**. Las medidas del plano son
constantes en el código y la geometría se arma a partir de ellas.

Esto importa porque **el modelo y el plano no pueden divergir**. Si mañana
cambia una cota, cambia el modelo. No hay una versión "artística" que se
desactualiza.

### Marca de dónde sale cada dato

Cada medida del sitio muestra su procedencia:

| Etiqueta | Significa |
|---|---|
| `COTA DE PLANO` | Está escrita en la lámina |
| `MEDIDO S/ PLANO` | No está acotada; se midió sobre el dibujo a escala verificada |
| `MEMORIA` | Sale de la memoria descriptiva |
| `POR DEFINIR` | No consta en la documentación |

### Se planta cuando la documentación no alcanza

Tres ejemplos concretos donde el agente **no completó el hueco**:

1. **Instalaciones.** No hay planos. El sistema de capas está armado, pero
   desagüe pluvial, agua caliente y ventilación figuran como `POR DEFINIR` en
   lugar de dibujar cañerías inventadas.

2. **Locales que pedí y no existen.** Mi brief pedía comedor y oficina de
   control. El plano no los tiene. El agente lo dejó anotado en vez de
   agregarlos.

3. **Una contradicción entre fuentes.** El diámetro del resorte interior del
   bogie aparece como **83 mm** en una ficha y **86 mm** en otra. En vez de
   elegir uno callado, muestra el valor de la especificación técnica y **deja la
   diferencia visible en pantalla** para que la confirme ingeniería.

Para mí eso es lo más valioso de todo el trabajo: un dato inventado en un plano
de fabricación es un problema caro, y el agente sostuvo la regla incluso cuando
le hubiera sido más fácil rellenar.

---

## Dónde se rompió

Ninguno de estos errores apareció leyendo el código. Todos aparecieron **al
abrir el sitio en el navegador y revisar la consola**.

| Síntoma | Causa | Corrección |
|---|---|---|
| Modelo 3D en negro | Se movían objetos mientras se recorría el árbol de la escena, lo que corrompía la iteración | Recolectar primero, mover después |
| Vista en planta en negro | Con la cámara exactamente encima del objetivo, la matriz de cámara degenera en `NaN` y no se recupera al cambiar de vista | Inclinarla unos pocos grados a propósito |
| Ninguna imagen en el sitio publicado | Rutas absolutas que apuntaban a la raíz del dominio en vez del subdirectorio del proyecto | Resolverlas contra la base del sitio |
| Primera publicación fallida | El flujo de trabajo corrió antes de que Pages estuviera habilitado | Relanzarlo una vez activado |
| Página en blanco en el archivo suelto | El script se ejecutaba antes de que existiera el contenedor donde dibujar | Emitirlo al final del documento |

Además, un intento de exportar el catálogo automatizando PowerPoint **se colgó**
y hubo que abandonarlo. Se resolvió cuando pasé los PDF directamente.

---

## Cómo está publicado

Repositorio → GitHub Actions compila → GitHub Pages publica. Cada cambio que
subo queda online en unos dos minutos, sin tocar nada más.

```bash
git add -A && git commit -m "cambios" && git push
```

**Stack:** React · TypeScript · Three.js (React Three Fiber) · Vite

---

## Qué falta y qué aprendí

### Qué falta

- **No anda bien en celular.** Está pensado para pantalla grande; en móvil los
  paneles del visor 3D se superponen. Es lo próximo.
- **Las imágenes de la portada son flojas.** Convendría reemplazarlas por vistas
  de los propios modelos 3D.
- **Faltan los planos de instalaciones y de fabricación de vagones.** Con ellos,
  los modelos pasarían de correctos a exactos.
- La hoja de estilos carga alfabetos que no uso (cirílico, griego); recortarla
  bajaría el peso inicial de 404 KB a unos 80 KB.

### Qué aprendí

**El agente rinde según lo que le des, no según cómo se lo pidas.** El salto de
calidad más grande no vino de un prompt mejor: vino de pasarle un PowerPoint con
las cotas reales. Antes de eso, con las mismas instrucciones, no podía hacer más
que aproximaciones.

**Poner una regla dura al principio vale más que corregir después.** El «no
inventes datos» del brief inicial gobernó todo el proyecto. El agente lo aplicó
en situaciones que yo no había previsto, y varias veces me avisó de huecos en la
documentación que yo no sabía que tenía.

**Hay que mirar el resultado, no el código.** Todos los errores serios
aparecieron abriendo el sitio, nunca leyendo lo que estaba escrito. Cuando le
dije «la documentación no abre bien», el problema era mucho más grande de lo que
yo veía: estaban rotas todas las imágenes del sitio, no solo esa sección.

**Se va por las ramas y hay que cortarlo.** Más de una vez se puso a construir
cosas que yo no había pedido. Un «pará» a tiempo ahorra bastante.

**El alcance creció solo.** La consigna decía «una tarde». Esto se fue muy por
encima de eso, y no por una decisión mía de entrada: cada resultado que
funcionaba me hacía pedir lo siguiente. Que sea fácil pedir más no significa que
convenga.
