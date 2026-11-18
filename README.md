# Personal

## Mi Cartera

App web para llevar el control de gastos, tarjetas de crédito y débito, compras a meses sin intereses, pagos, plan de pagos según tus ingresos y metas de ahorro, con gráficas y fotos de tickets.

Los datos se guardan en Firebase (proyecto `personal-75acf`): inicias sesión con Google y cada usuario solo puede ver sus propios datos.

### Configuración de Firebase

1. **Authentication → Sign-in method**: activa Google.
2. **Authentication → Settings → Authorized domains**: agrega `eliaflores.github.io` (y `localhost` si la pruebas en tu compu).
3. **Firestore Database → Rules**: pega el contenido de [`firestore.rules`](firestore.rules) y publica.
4. **Storage → Rules** (solo con plan Blaze): pega [`storage.rules`](storage.rules) y publica. Sin Storage, las fotos se guardan comprimidas dentro de Firestore.

La configuración web de Firebase que está en el código no es secreta; la seguridad depende de las reglas.

### Abrirla

- En línea: activa GitHub Pages (Settings → Pages, rama `main`) y entra a `https://eliaflores.github.io/Personal/mi-cartera/`.
- En tu compu: sírvela con `npx serve .` y abre `http://localhost:3000/mi-cartera/` (abrir el archivo directo con doble clic no permite iniciar sesión con Google).

## Regalos

App aparte (carpeta [`regalos/`](regalos/)) para regalarse en pareja:

- **Mi wishlist:** cada quien sube regalos con foto, descripción, link, precio y ocasión (Navidad, Aniversario, San Valentín, Cumpleaños u Otro). La wishlist se queda para todas las festividades.
- **Nueva festividad:** preguntas una por una (qué celebras, cuándo y tu presupuesto). Después solo salen los regalos de tu pareja que te alcanzan. El presupuesto queda fijo.
- **Compras secretas:** vas tachando lo que ya compraste y lo que te queda se va restando. Tu pareja no ve tus festividades, tu presupuesto ni lo que compraste; las reglas de Firestore lo impiden.

- **Precio y foto del link:** al pegar el link de la tienda, la app busca al momento el precio, la foto y la entrega (con Jina Reader desde el cel), y después se revisan cada 3 horas, así el precio no se queda viejo. Lo hace el Action [`Regalos - precios de la tienda`](.github/workflows/regalos-precios.yml) cada 10 minutos con [`regalos-precios/`](regalos-precios/). Si una tienda no deja leer su página (Amazon a veces pide captcha), se usa el precio que se puso a mano.

- **Fechas y avisos:** cada festividad puede tener fecha. Si activas los avisos en Ajustes, te llega una notificación 14, 7, 3 y 1 día antes y el mismo día ("Quedan 3 días para Navidad 2026, ¿ya compraste tus regalos?"). Lo manda el Action [`Regalos - avisos de festividades`](.github/workflows/regalos-avisos.yml) cada mañana, solo a los cels de quien creó la festividad.
- **¿Llega a tiempo?:** si la tienda dice cuándo entrega (Amazon lo dice), la app avisa en rojo cuando un regalo llegaría después de la fecha de la festividad.
- **Colores:** en Ajustes se elige el tema Colorido (normal) o Discreto (gris perla).

Usa el mismo proyecto de Firebase para iniciar sesión con Google, pero guarda todo en su propia colección (`regalos`), separada de los datos de Mi Cartera. Las fotos que se suben se guardan comprimidas dentro de Firestore. El Action de precios usa el mismo secreto `FIREBASE_SERVICE_ACCOUNT` que los recordatorios y no imprime links ni precios en sus registros, porque el repo es público.

### Configuración

1. **Firestore Database → Rules**: pega todo el contenido de [`firestore.rules`](firestore.rules) (trae las reglas de Mi Cartera y las de Regalos) y publica.
2. **Authentication → Settings → Authorized domains**: confirma que está `eliaflores.github.io`.
3. Abre `https://eliaflores.github.io/Personal/regalos/`, entra con Google y toca **Crear nuestra lista**. Comparte el link de invitación con tu pareja; la lista admite dos personas.
4. Para tenerla como app en el cel: en Safari, Compartir → Agregar a inicio; en Chrome, menú → Agregar a la pantalla principal.
