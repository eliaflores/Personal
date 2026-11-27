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

## Nuestros Planes

App aparte (carpeta [`planes/`](planes/)) para planear en pareja. Solo la ven las dos personas conectadas:

- **Ideas de planes:** cada quien propone planes con emoji, tipo (comida, salida, viaje, en casa…), descripción, lugar y link. Se desglosan en **actividades** (con hora y costo) y **otros gastos** (transporte, entradas, hospedaje…), y la app suma el **costo aproximado** y cuánto toca a cada quien. Se pueden **conectar con otros planes** (ej. "Viaje a Oaxaca" con "Tour de mezcal"), darles ♥ y marcarlos como hechos (quedan en *Recuerdos*). Hay un dado para elegir un plan al azar.
- **¿Quién propone más?:** en Inicio y en *Nosotros* se ve cuántas ideas propuso cada quien, cuántas ya hicieron, los corazones recibidos y los eventos agendados.
- **Calendario compartido:** vista de **día, semana y mes** (se puede deslizar a los lados). Cada evento tiene tipo, fecha, hora de inicio y fin (o todo el día, o varios días), lugar, notas, se puede **repetir** (cada semana, mes o año, ideal para cumpleaños y aniversarios) y se puede **conectar con un plan** de la lista. En la vista de día o semana, tocar una hora vacía agenda algo a esa hora. Cada evento tiene botón para agregarlo a Google Calendar.
- **Cuenta regresiva y avisos:** Inicio muestra cuántos días (u horas) faltan para lo siguiente. Si activan los avisos en *Nosotros*, a los dos les llega "Faltan 7 días para…", "Mañana…", "Hoy…" y "En 1 hora…", según los avisos que elijan en cada evento (1 mes, 2 semanas, 1 semana, 3 días, 1 día, el mismo día, 3 h, 1 h o 30 min antes). También le avisa a uno cuando el otro propone un plan o agenda algo. Lo manda el Action [`Planes - avisos del calendario`](.github/workflows/planes-avisos.yml) cada 15 minutos con [`planes-avisos/`](planes-avisos/); usa el mismo secreto `FIREBASE_SERVICE_ACCOUNT` y no imprime nombres, títulos ni fechas en sus registros.
- **Tipos de plan y colores:** en *Nosotros → Tipos de plan y colores* (o con "+ Nuevo tipo" al crear una idea o un evento) se agregan tipos propios con nombre, ícono y color, que sirven para ideas y calendario. También se le puede cambiar el color a los tipos de siempre. Se guardan en el espacio de la pareja (`tipos` y `colores`).
- **Atajos en la pantalla de inicio:** [`planes/nueva-idea.html`](planes/nueva-idea.html) y [`planes/agendar.html`](planes/agendar.html) tienen su propio ícono; agregados a la pantalla de inicio desde Safari, abren directo el formulario. Los links se copian en *Nosotros → Atajos para tu pantalla de inicio*.
- **Notion:** el calendario se copia solo a la base de datos "Nuestros Planes" de Notion (de la app a Notion), con [`planes-avisos/notion.js`](planes-avisos/notion.js) en el mismo Action de los avisos. Cada 15 minutos manda lo nuevo o cambiado; cada hora archiva en Notion lo que se borró en la app y mueve los eventos que se repiten a su siguiente fecha. Necesita el secreto `NOTION_TOKEN` (ver abajo).
- **Pendientes:** lista compartida de cosas por hacer (pestaña *Pendientes* y en Inicio). Cada una puede ser para los dos o para uno, con fecha límite y notas; se tachan al hacerlas. El día de la fecha límite les llega "Pendiente para hoy" (desde las 9:00) y, si uno le agrega un pendiente al otro, le avisa. Se guardan en `planes/{id}/pendientes` (requiere las reglas nuevas).
- **Tema:** Auto (sigue al cel), Claro u Oscuro, en *Nosotros*.

Usa el mismo proyecto de Firebase e inicio de sesión con Google, pero guarda todo en su propia colección (`planes`), separada de Mi Cartera y de Regalos.

### Configuración

1. **Firestore Database → Rules**: pega todo el contenido de [`firestore.rules`](firestore.rules) (trae las reglas de Mi Cartera, Regalos y Planes) y publica.
2. Abre `https://eliaflores.github.io/Personal/planes/`, entra con Google y toca **Crear nuestro espacio**. Comparte el link de invitación con tu pareja; el espacio admite dos personas.
3. Cada quien, en *Nosotros → Avisos en este cel*, activa los avisos (en iPhone primero hay que agregar la app a la pantalla de inicio).

### Conectar con Notion

1. En [notion.so/profile/integrations](https://www.notion.so/profile/integrations) crea una integración **interna** llamada "Nuestros Planes" y copia su **Internal Integration Secret**.
2. En Notion abre la base **Nuestros Planes**, toca **•••** → **Conexiones** → **Nuestros Planes** para darle acceso.
3. En GitHub: Settings → Secrets and variables → Actions → **New repository secret**, nombre `NOTION_TOKEN`, y pega el secreto.
4. En Actions → *Planes - avisos y Notion* → **Run workflow** para que se copie todo de una vez (o espera 15 minutos).

## Täglich (alemán diario)

App aparte (carpeta [`aleman/`](aleman/)) para aprender alemán un poco cada día, del A1 al B1, explicada en español. Está hecha con lo que la investigación sabe sobre cómo se aprende (en la app, *Yo → La ciencia detrás de la app* explica cada punto con sus referencias):

- **Repetición espaciada con FSRS-5:** cada palabra tiene su propio calendario. La app estima qué tan firme está cada recuerdo y te la vuelve a preguntar justo cuando la probabilidad de recordarla baja al 90% (se puede cambiar a 85% o 95% en Ajustes).
- **Recuperación activa y dificultad adaptativa:** casi todo son ejercicios donde tienes que recordar. Cada palabra pasa de reconocerla a escribirla, completarla en una frase, escucharla y decirla. Si aciertas más del ~93% los ejercicios se ponen más difíciles y si bajas del ~72% más guiados, para quedarte cerca del 85%, la zona donde más se aprende.
- **Test de aprendizaje al empezar:** pregunta tu meta (conversar, entender, leer, escribir o un examen), qué disfrutas, dónde estudias (con prueba de audio y micrófono), cuánto duran tus sesiones, si prefieres la regla o los ejemplos primero y cuánto reto te gusta. Con eso cambia qué ejercicios salen más, el tamaño de las sesiones, la meta diaria, si hay audio/micrófono, el orden de la gramática y qué tan rápido sube la dificultad. Después mide tus aciertos por habilidad y te da más práctica en la que vaya más baja. No usa «estilos de aprendizaje» (visual, auditivo…), porque los estudios muestran que enseñar según el estilo no mejora el aprendizaje. Se puede rehacer desde *Yo* o *Ajustes*.
- **Calificación automática:** no hay que autoevaluarse. La app califica según si acertaste, si fue con falta de ortografía, si pediste pista y qué tan rápido respondiste.
- **Corrección inteligente:** acepta `ae/oe/ue/ss` en lugar de `ä/ö/ü/ß`, perdona faltas de ortografía pequeñas, exige el artículo en los sustantivos, avisa de las mayúsculas y detecta cuando escribiste otra palabra que existe (Butter en vez de Mutter). Cada error trae su explicación: la regla de género, la conjugación o el porqué de la gramática, y la palabra vuelve a salir unos ejercicios después.
- **Contenido:** 734 palabras en 23 unidades (con artículo y color por género, plural, ejemplo, audio y notas), 30 temas de gramática con 330 ejercicios y 17 lecturas graduadas con audio, traducción por frase, palabras que se tocan para ver su significado y preguntas de comprensión.
- **Ejercicios:** elegir, escribir, der/die/das, plural, completar frases, ordenar fichas, dictado, escuchar, hablar (reconocimiento de voz), conjugar, Perfekt y parejas.
- **Ruta tipo camino:** unidades con lecciones, gramática y lectura. Si ya sabes algo, hay un examen para saltar unidades.
- **Aprende viendo:** en *Practicar* (y una recomendación en *Hoy*) hay series y canales en alemán por nivel, del A1 al B2: Nicos Weg, Extr@, Peppa Wutz, Easy German, Die Sendung mit der Maus, logo!, Jojo sucht das Glück, Tagesschau en 100 segundos, How to Sell Drugs Online (Fast), Wir sind die Welle, Dark, Die Kaiserin y Biohackers. Cada capítulo es una lección con objetivo, qué hacer antes, mientras y después de verlo, y botones que abren dónde verlo (YouTube, Netflix o el sitio oficial). Al marcarlo como visto suma XP y cuenta para la racha. No forma parte de la ruta.
- **Hábito:** meta diaria, racha con protectores (ganas uno cada 7 días), calendario de constancia, límite de palabras nuevas por día y un plan de «cuándo y dónde» vas a estudiar.
- **Estadísticas:** nivel estimado (A1/A2/B1), retención real, repasos de los próximos 14 días, estado de tu memoria, aciertos por tipo de ejercicio y tus palabras más difíciles.
- **Sin internet:** se instala como app y funciona offline; el progreso se sube cuando vuelve la conexión.

Se entra con Google o con correo y contraseña, o se puede probar sin cuenta (el progreso queda solo en ese dispositivo y se sube a la cuenta la primera vez que entras). Usa el mismo proyecto de Firebase, pero guarda todo en su propia colección (`aleman/{uid}`), separada de Mi Cartera, Regalos y Planes; cada quien solo puede ver lo suyo.

- **Recordatorio diario:** si en *Yo → Ajustes* activas el recordatorio, a la hora que elegiste (en tu zona horaria) te llega «🔥 ¡No pierdas tu racha de 12 días!» o «🧠 Tus palabras se están olvidando», solo si ese día todavía no has estudiado. Lo manda el Action [`Täglich - recordatorio diario de alemán`](.github/workflows/aleman-avisos.yml) cada hora con [`aleman-avisos/`](aleman-avisos/); usa el mismo secreto `FIREBASE_SERVICE_ACCOUNT` y no imprime nombres ni progreso en sus registros.

### Configuración

1. **Firestore Database → Rules**: pega todo el contenido de [`firestore.rules`](firestore.rules) (ahora también trae las reglas de `aleman`) y publica.
2. **Authentication → Sign-in method**: Google ya está activo; para entrar con correo activa también **Correo electrónico/contraseña**.
3. Abre `https://eliaflores.github.io/Personal/aleman/` y entra. Para tenerla como app en el cel: en Safari, Compartir → Agregar a inicio; en Chrome, menú → Agregar a la pantalla principal (en iPhone los avisos solo funcionan desde la app agregada a inicio).

### Pruebas

`node aleman/pruebas.mjs` revisa el motor y todo el contenido (más de 29 000 comprobaciones: que cada ejercicio generado acepte su respuesta correcta, conjugaciones, FSRS, etc.) y `node aleman-avisos/pruebas.js` la lógica del recordatorio.

## Mi Oficina

App aparte (carpeta [`oficina/`](oficina/)) para el trabajo, pensada para el cel y para la compu. Se ve como un pizarrón de corcho con post-its (de noche, o con el tema *Pizarrón*, se vuelve pizarrón verde con letras de gis):

- **Inicio (todo en una pantalla):** saludo con el resumen del día, cuatro post-its con lo más importante (eventos de hoy, pendientes, vencidos y requisiciones por meter), la semana con lo que hay cada día, la agenda de hoy en una ficha rayada, tus pendientes como post-its (con uno en blanco para anotar rápido) y la tabla con clip de las requisiciones por meter.
- **Pestañas por área:** *Calendario*, *Pendientes*, *Requisiciones* y *Ajustes*. En la compu son pestañas de folder arriba del corcho; en el cel, la barra de abajo y un botón rojo para agregar.
- **Calendario:** vista de mes (calendario de pared) y de agenda. Cada evento tiene fecha, hora o todo el día (o varios días), lugar, link de la junta, área, notas, avisos (15 min, 30 min, 1 h o 1 día antes) y se puede repetir (entre semana, cada semana, mes o año). También salen ahí los pendientes y las requisiciones con fecha, y los eventos de tus calendarios de Apple, Google y Notion (se pueden ocultar por fuente). Cada evento tiene botón para Google Calendar y para descargarlo a Apple (.ics).
- **Pendientes:** post-its de colores con fecha, hora (te avisa 30 min antes), urgente, área y notas. Filtros por *Para hoy*, *Esta semana*, *Sin fecha* y *Hechos*, y por área. Se tachan con el círculo.
- **Requisiciones:** qué se pide, cantidad, proveedor, monto, área o centro de costos, para cuándo hay que meterla, link (cotización o sistema) y notas. Pasan por *Por meter → Metida (con folio) → Autorizada → Recibida* con un botón, y cada paso pone su sello; las rechazadas regresan a *Por meter*. En la compu se ven en cuatro bandejas.
- **Áreas:** en *Ajustes* se crean las tuyas (nombre y color) para separar pendientes, requisiciones y eventos.
- **Colores por palabra:** los eventos cuyo nombre diga “comida” o “actividad” salen en naranja (también los de Notion y Apple). En *Ajustes → Colores por palabra* se cambian las palabras y el color, o se agregan más.
- **Atajos:** en Android, al dejar presionado el ícono salen *Nuevo pendiente*, *Nuevo evento* y *Nueva requisición* (también sirven los links `oficina/?nuevo=pendiente`, `?nuevo=evento` y `?nuevo=requisicion`).
- **Demo:** en la pantalla de entrada, *Ver la demo sin cuenta* la muestra con datos de ejemplo (se guardan solo en ese dispositivo).
- **Para agregar más secciones:** en [`oficina/app.js`](oficina/app.js) se suma una entrada a `TABS` con su función de vista.

Usa el mismo proyecto de Firebase e inicio de sesión con Google, pero guarda todo en su propia colección (`oficina/{uid}`), separada de las otras apps; cada quien solo ve lo suyo.

### Avisos al cel, calendarios y Notion

Lo hace el Action [`Mi Oficina - avisos, calendarios y Notion`](.github/workflows/oficina-avisos.yml) cada 15 minutos con [`oficina-avisos/`](oficina-avisos/). Usa el mismo secreto `FIREBASE_SERVICE_ACCOUNT` y no imprime nombres, títulos, links ni fechas en sus registros, porque el repo es público.

- **Avisos:** resumen del día a la hora y en los días que elijas (por omisión 8:00 de lunes a viernes: “3 eventos (el primero a las 9:30 am: Junta) · 2 pendientes para hoy, 1 vencido · 1 requisición por meter hoy”), los avisos de cada evento, los pendientes con hora y las requisiciones un día antes de su fecha. Todo se apaga o prende en *Ajustes → Avisos al cel*.
- **Calendarios de Apple / Google / Outlook → la app:** en *Ajustes* pegas el link del calendario (el *Calendario público* de iCloud, la *dirección secreta en formato iCal* de Google o el ICS de Outlook). El Action lo lee, entiende las repeticiones, excepciones y zonas horarias, y guarda de 30 días atrás a 6 meses adelante en `oficina/{uid}/externos`.
- **Notion ↔ la app:** en *Ajustes* pegas el link de una base de datos de Notion. Lo que agendas en la app se copia a esa base (y se actualiza o se archiva si lo cambias o lo borras), y lo que agregues con fecha directo en la base aparece en el calendario de la app. Si a la base le faltan columnas, el Action las agrega (*ID app*, *Lugar*, *Notas*, *Área*, *Abrir en la app*). Usa su propia llave, el secreto `NOTION_TOKEN_OFICINA`; si no existe, usa la de Nuestros Planes (`NOTION_TOKEN`). Cada app solo lee y escribe en su propia base, aunque compartan llave.
- **La app → Apple Calendar (opcional):** con *Ajustes → Ver Mi Oficina en Apple Calendar* se publica un calendario con tus eventos, pendientes y requisiciones con fecha, como un gist secreto de GitHub, y te da el link `webcal://` para suscribirte desde el iPhone, la Mac o Google. Se actualiza cuando algo cambia. Si lo apagas, el gist se borra.

### Configuración

1. **Firestore Database → Rules**: pega todo el contenido de [`firestore.rules`](firestore.rules) (ahora también trae las reglas de `oficina`) y publica.
2. Abre `https://eliaflores.github.io/Personal/oficina/` y entra con Google. Para tenerla como app en el cel: en Safari, Compartir → Agregar a inicio; en Chrome, menú → Instalar app.
3. En cada dispositivo: *Ajustes → Avisos al cel → Activar* (en iPhone, desde la app agregada a inicio).
4. **Notion** (opcional):
   1. En [notion.so/profile/integrations](https://www.notion.so/profile/integrations) crea una integración **interna** llamada “Mi Oficina” y copia su **Internal Integration Secret**.
   2. En GitHub: Settings → Secrets and variables → Actions → **New repository secret**, nombre `NOTION_TOKEN_OFICINA`, y pega el secreto.
   3. En Notion abre la base **Mi Oficina**, toca **•••** → **Conexiones** → agrega **Mi Oficina**. Copia el link de la base (**•••** → *Copiar enlace*) y pégalo en la app, en *Ajustes → Notion*.
5. **Calendario para Apple** (opcional):
   1. En GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → *Generate new token*, con **Account permissions → Gists: Read and write** (nada más).
   2. En este repo: Settings → Secrets and variables → Actions → **New repository secret**: `GIST_TOKEN` con ese token, y `OFICINA_CORREOS` con tu correo de Google (así nadie más puede crear calendarios con tu cuenta).
   3. En la app, *Ajustes → Ver Mi Oficina en Apple Calendar* → prende *Publicar mi calendario*. En máx. 15 min aparece el link para suscribirte.
6. Para probarlo todo de una vez: Actions → *Mi Oficina - avisos, calendarios y Notion* → **Run workflow**.

### Pruebas

`node oficina-avisos/pruebas.js` revisa los avisos (zonas horarias, repeticiones, resumen del día), la lectura de calendarios .ics (zonas, repeticiones, excepciones, eventos movidos), la sincronización con Notion y el calendario para Apple, sin Firebase ni internet. El Action las corre antes de mandar nada.
