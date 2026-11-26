// Calendario de Mi Oficina para suscribirse desde Apple Calendar (o Google/Outlook).
// Se publica como un gist secreto de GitHub (solo lo puede ver quien tenga el link) y se actualiza cuando algo cambia.
// Necesita el secreto GIST_TOKEN (un token de GitHub con permiso de Gists) y OFICINA_CORREOS (los correos que pueden usarlo),
// para que nadie más que tú cree calendarios con tu cuenta de GitHub.
const crypto = require("crypto");

const FILE = "mi-oficina.ics";
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);

async function gh(token, method, path, body, fetchImpl = fetch) {
  const res = await fetchImpl("https://api.github.com" + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "mi-oficina-calendario", "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(`GitHub respondió ${res.status}`); e.status = res.status; throw e; }
  return data;
}

// Publica (o actualiza) el .ics. `feed` es lo que ya está guardado en el perfil: { gistId, url, hash }.
// Devuelve lo nuevo para guardar en el perfil, o null si no cambió nada.
async function publish({ token, ics, feed = {}, fetchImpl = fetch }) {
  const h = hash(ics.replace(/^DTSTAMP:.*$/gm, ""));   // la marca de tiempo cambia siempre; no cuenta como cambio
  if (feed.gistId && feed.hash === h && feed.url) return null;
  let id = feed.gistId, login = feed.login;
  if (id) {
    try { const g = await gh(token, "PATCH", `/gists/${id}`, { files: { [FILE]: { content: ics } } }, fetchImpl); login = g.owner && g.owner.login; }
    catch (e) { if (e.status === 404) id = null; else throw e; }
  }
  if (!id) {
    const g = await gh(token, "POST", "/gists", { description: "Mi Oficina (calendario)", public: false, files: { [FILE]: { content: ics } } }, fetchImpl);
    id = g.id; login = g.owner && g.owner.login;
  }
  const url = `https://gist.githubusercontent.com/${login}/${id}/raw/${FILE}`;
  return { gistId: id, login, url, hash: h };
}

const friendly = (e) => (e.status === 401 || e.status === 403
  ? "El token de GitHub no sirve o no tiene permiso de Gists (secreto GIST_TOKEN)."
  : "No se pudo publicar el calendario. Se intenta otra vez en 15 min.");

module.exports = { publish, friendly, hash, FILE };

// Si se apaga el calendario para Apple, se borra el gist (ya nadie lo puede ver con el link).
async function remove({ token, gistId, fetchImpl = fetch }) {
  if (!gistId) return;
  try { await gh(token, "DELETE", `/gists/${gistId}`, null, fetchImpl); } catch (e) { if (e.status !== 404) throw e; }
}
module.exports.remove = remove;
