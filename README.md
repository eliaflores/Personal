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
