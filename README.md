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

App aparte (carpeta [`regalos/`](regalos/)) para una wishlist en pareja: cada quien agrega links de regalos con precio y ocasión (Navidad, Aniversario, San Valentín, Cumpleaños u Otro). Quien regala pone primero su presupuesto y la ocasión, y solo le salen los regalos que caben. Puede "apartar" uno sin que la otra persona lo vea en su lista.

Usa el mismo proyecto de Firebase para iniciar sesión con Google, pero guarda todo en su propia colección (`regalos`), separada de los datos de Mi Cartera.

### Configuración

1. **Firestore Database → Rules**: pega otra vez todo el contenido de [`firestore.rules`](firestore.rules) (ya trae las reglas de Mi Cartera y las de Regalos) y publica.
2. **Authentication → Settings → Authorized domains**: confirma que está `eliaflores.github.io`.
3. Abre `https://eliaflores.github.io/Personal/regalos/` (GitHub Pages, rama `main`), entra con Google y toca **Crear nuestra lista**. Comparte el link de invitación con tu pareja; la lista admite dos personas.
4. Para tenerla como app en el cel: en Safari, Compartir → Agregar a inicio; en Chrome, menú → Agregar a la pantalla principal.
