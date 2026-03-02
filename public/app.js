// ══════════════════════════════════════════════
// app.js — Frontend que se conecta a la API
// Cada acción llama al servidor Express que usa
// las clases reales de TypeScript
// ══════════════════════════════════════════════

const API = "https://sistema-gestion-biblioteca-production.up.railway.app/api";

// ── NAVEGACIÓN ──
const PAGES = {
  dashboard:  { title:"Inicio",      sub:"Resumen general del sistema" },
  libros:     { title:"Libros",      sub:"Catálogo de libros y ejemplares" },
  usuarios:   { title:"Usuarios",    sub:"Estudiantes y docentes" },
  prestamos:  { title:"Préstamos",   sub:"Control de préstamos activos" },
  devolucion: { title:"Devolución",  sub:"Registrar devolución de un libro" },
  alertas:    { title:"Alertas",     sub:"Préstamos próximos a vencer" },
  multas:     { title:"Multas",      sub:"Control de multas por retraso" },
  historial:  { title:"Historial",   sub:"Registro completo de devoluciones" },
};

function goTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => {
    if (n.getAttribute("onclick") === `goTo('${page}')`) n.classList.add("active");
  });
  document.getElementById("topbar-title").textContent = PAGES[page].title;
  document.getElementById("topbar-sub").textContent   = PAGES[page].sub;
  renderPage(page);
}

async function renderPage(page) {
  if (page === "dashboard")  await renderDashboard();
  if (page === "libros")     await renderLibros();
  if (page === "usuarios")   await renderUsuarios();
  if (page === "prestamos")  await renderPrestamos();
  if (page === "devolucion") await renderDevolucion();
  if (page === "alertas")    await renderAlertas();
  if (page === "multas")     await renderMultas();
  if (page === "historial")  await renderHistorial();
}

// ── HELPERS ──
async function api(endpoint, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + endpoint, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error del servidor");
  return data;
}

function fmtFecha(d) {
  return new Date(d).toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"numeric" });
}

function badge(estado) {
  const map = { ACTIVO:"badge-activo", VENCIDO:"badge-vencido", DEVUELTO:"badge-devuelto" };
  return `<span class="badge ${map[estado]||""}">${estado}</span>`;
}

function empty(msg = "Sin registros") {
  return `<tr><td colspan="10"><div class="empty"><div class="empty-icon">📭</div><h4>${msg}</h4><p>No hay datos aún.</p></div></td></tr>`;
}

function toast(msg, tipo = "success") {
  const el = document.createElement("div");
  el.className = "toast-item";
  el.style.background = tipo === "error" ? "#dc2626" : tipo === "warning" ? "#d97706" : "#16a34a";
  el.textContent = msg;
  document.getElementById("toast").appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
  if (id === "modal-prestamo") fillPrestamoSelects();
}
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

function alertHtml(msg, tipo = "error") {
  return `<div class="alert alert-${tipo}"><span class="alert-icon">${tipo==="error"?"⚠":"✅"}</span>${msg}</div>`;
}

// ── BADGES SIDEBAR ──
async function updateBadges() {
  try {
    const data = await api("/alertas");
    const total = data.proximos.length + data.vencidos.length;
    const ba = document.getElementById("badge-alertas");
    ba.textContent = total;
    ba.style.display = total > 0 ? "" : "none";

    const multas = await api("/multas");
    const pendientes = multas.filter(m => !m.pagada).length;
    const bm = document.getElementById("badge-multas");
    bm.textContent = pendientes;
    bm.style.display = pendientes > 0 ? "" : "none";
  } catch {}
}

// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
async function renderDashboard() {
  try {
    const [libros, usuarios, prestamos, alertas] = await Promise.all([
      api("/libros"), api("/usuarios"), api("/prestamos"), api("/alertas")
    ]);

    document.getElementById("stat-libros").textContent   = libros.length;
    document.getElementById("stat-usuarios").textContent = usuarios.length;
    document.getElementById("stat-activos").textContent  = prestamos.filter(p => p.estado === "ACTIVO").length;
    document.getElementById("stat-vencidos").textContent = prestamos.filter(p => p.estado === "VENCIDO").length;

    // Préstamos recientes
    const tb = document.getElementById("dash-prestamos");
    const recientes = [...prestamos].reverse().slice(0, 5);
    tb.innerHTML = recientes.length
      ? recientes.map(p => {
          const dr = p.diasRestantes;
          const diasStr = dr < 0
            ? `<span style="color:#dc2626;font-weight:600">Vencido ${Math.abs(dr)}d</span>`
            : `${dr} días`;
          return `<tr><td>${p.usuario}</td><td>${p.libro}</td><td>${badge(p.estado)}</td><td>${diasStr}</td></tr>`;
        }).join("")
      : empty("Sin préstamos");

    // Alertas dashboard
    const ab = document.getElementById("dash-alertas-body");
    const todas = [...alertas.vencidos, ...alertas.proximos];
    ab.innerHTML = todas.length
      ? todas.map(p => {
          const dr = p.diasRestantes;
          const tipo = dr < 0 ? "alert-error" : "alert-warning";
          const msg  = dr < 0 ? `Vencido hace ${Math.abs(dr)} día(s)` : `Vence en ${dr} día(s)`;
          return `<div class="alert ${tipo}"><span class="alert-icon">${dr<0?"🔴":"⏰"}</span><div><strong>${p.usuario}</strong> — ${p.libro}<br/><small>${msg}</small></div></div>`;
        }).join("")
      : `<div class="empty"><div class="empty-icon">✅</div><h4>Sin alertas</h4><p>Todo al día.</p></div>`;

    // Libros
    document.getElementById("dash-libros").innerHTML = libros.slice(0, 5).map(l =>
      `<tr><td>${l.id}</td><td>${l.titulo}</td><td>${l.autor}</td><td>${l.categoria}</td>
       <td>${l.disponible ? '<span class="badge badge-activo">Sí</span>' : '<span class="badge badge-vencido">No</span>'}</td></tr>`
    ).join("");

    updateBadges();
  } catch (e) {
    console.error(e);
  }
}

// ══════════════════════════════════════════════
// LIBROS
// ══════════════════════════════════════════════
async function renderLibros() {
  const libros = await api("/libros");
  const tb = document.getElementById("tabla-libros");
  tb.innerHTML = libros.length
    ? libros.map(l => `
        <tr>
          <td><strong>${l.id}</strong></td><td>${l.titulo}</td><td>${l.autor}</td>
          <td>${l.categoria}</td><td>${l.dias} días</td>
          <td>${l.disponible ? '<span class="badge badge-activo">Disponible</span>' : '<span class="badge badge-vencido">Sin stock</span>'}</td>
          <td>${l.prestable ? '<span class="badge badge-activo">Sí</span>' : '<span class="badge badge-vencido">No</span>'}</td>
        </tr>`).join("")
    : empty("Sin libros registrados");
}

async function registrarLibro() {
  const id       = document.getElementById("l-id").value.trim();
  const titulo   = document.getElementById("l-titulo").value.trim();
  const autor    = document.getElementById("l-autor").value.trim();
  const catEnum  = document.getElementById("l-cat").value;
  const dias     = parseInt(document.getElementById("l-dias").value) || 7;
  const prestable= document.getElementById("l-prestable").value === "true";
  const ejCods   = document.getElementById("l-ejemplares").value.split(",").map(c => c.trim()).filter(Boolean);
  const alertEl  = document.getElementById("alert-libro");

  if (!id || !titulo || !autor) { alertEl.innerHTML = alertHtml("Completa todos los campos."); return; }
  if (!ejCods.length)           { alertEl.innerHTML = alertHtml("Agrega al menos un código de ejemplar."); return; }

  try {
    await api("/libros", "POST", { id, titulo, autor, categoriaEnum: catEnum, dias, prestable, ejemplares: ejCods });
    closeModal("modal-libro");
    alertEl.innerHTML = "";
    ["l-id","l-titulo","l-autor","l-ejemplares"].forEach(i => document.getElementById(i).value = "");
    renderLibros();
    toast(`Libro "${titulo}" registrado.`);
  } catch (e) {
    alertEl.innerHTML = alertHtml(e.message);
  }
}

// ══════════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════════
async function renderUsuarios() {
  const usuarios = await api("/usuarios");
  const tipos = { PRIMARIA:"Est. Primaria", SECUNDARIA:"Est. Secundaria", DOCENTE:"Docente" };
  const tb = document.getElementById("tabla-usuarios");
  tb.innerHTML = usuarios.length
    ? usuarios.map(u => `
        <tr>
          <td><strong>${u.id}</strong></td><td>${u.nombre}</td>
          <td>${tipos[u.tipo] || u.tipo}</td><td>${u.max} préstamos</td>
        </tr>`).join("")
    : empty("Sin usuarios registrados");
}

async function registrarUsuario() {
  const id     = document.getElementById("u-id").value.trim();
  const nombre = document.getElementById("u-nombre").value.trim();
  const tipo   = document.getElementById("u-tipo").value;
  const alertEl= document.getElementById("alert-usuario");

  if (!id || !nombre) { alertEl.innerHTML = alertHtml("Completa todos los campos."); return; }

  try {
    await api("/usuarios", "POST", { id, nombre, tipo });
    closeModal("modal-usuario");
    alertEl.innerHTML = "";
    ["u-id","u-nombre"].forEach(i => document.getElementById(i).value = "");
    renderUsuarios();
    toast(`Usuario "${nombre}" registrado.`);
  } catch (e) {
    alertEl.innerHTML = alertHtml(e.message);
  }
}

// ══════════════════════════════════════════════
// PRÉSTAMOS
// ══════════════════════════════════════════════
async function renderPrestamos() {
  const prestamos = await api("/prestamos");
  const tb = document.getElementById("tabla-prestamos");
  tb.innerHTML = prestamos.length
    ? [...prestamos].reverse().map(p => {
        const dr = p.diasRestantes;
        const diasStr = p.estado === "DEVUELTO" ? "—"
          : dr < 0 ? `<span style="color:#dc2626;font-weight:600">-${Math.abs(dr)}</span>`
          : `<span style="color:#16a34a">${dr}</span>`;
        return `<tr>
          <td><strong>${p.id}</strong></td><td>${p.usuario}</td><td>${p.libro}</td>
          <td>${fmtFecha(p.inicio)}</td><td>${fmtFecha(p.vencimiento)}</td>
          <td>${diasStr}</td><td>${badge(p.estado)}</td>
        </tr>`;
      }).join("")
    : empty("Sin préstamos registrados");
}

async function fillPrestamoSelects() {
  const [usuarios, libros] = await Promise.all([api("/usuarios"), api("/libros")]);
  document.getElementById("p-usuario").innerHTML =
    '<option value="">-- Selecciona usuario --</option>' +
    usuarios.map(u => `<option value="${u.id}">${u.nombre} (${u.tipo})</option>`).join("");
  document.getElementById("p-libro").innerHTML =
    '<option value="">-- Selecciona libro --</option>' +
    libros.filter(l => l.esPrestable)
      .map(l => `<option value="${l.id}">${l.titulo}</option>`).join("");
}

async function realizarPrestamo() {
  const usuarioId = document.getElementById("p-usuario").value;
  const libroId   = document.getElementById("p-libro").value;
  const alertEl   = document.getElementById("alert-prestamo");

  if (!usuarioId || !libroId) { alertEl.innerHTML = alertHtml("Selecciona usuario y libro."); return; }

  try {
    const data = await api("/prestamos", "POST", { usuarioId, libroId });
    closeModal("modal-prestamo");
    alertEl.innerHTML = "";
    renderPrestamos();
    updateBadges();
    toast(`Préstamo ${data.prestamo.id} creado. Vence: ${fmtFecha(data.prestamo.vencimiento)}`);
  } catch (e) {
    alertEl.innerHTML = alertHtml(e.message);
  }
}

// ══════════════════════════════════════════════
// DEVOLUCIÓN
// ══════════════════════════════════════════════
async function renderDevolucion() {
  const prestamos = await api("/prestamos");
  const activos   = prestamos.filter(p => p.estado === "ACTIVO" || p.estado === "VENCIDO");
  const sel = document.getElementById("dev-select");

  sel.innerHTML = '<option value="">-- Elige un préstamo --</option>' +
    activos.map(p => {
      const dr = p.diasRestantes;
      const aviso = dr < 0 ? ` ⚠ VENCIDO ${Math.abs(dr)}d` : ` (${dr}d restantes)`;
      return `<option value="${p.id}">${p.id} — ${p.usuario} · "${p.libro}"${aviso}</option>`;
    }).join("");

  sel.onchange = () => showDevInfo(sel.value, activos);
  document.getElementById("dev-info").style.display = "none";
  document.getElementById("dev-resultado").innerHTML = "";
}

function showDevInfo(pid, activos) {
  const infoEl = document.getElementById("dev-info");
  if (!pid) { infoEl.style.display = "none"; return; }
  const p = activos.find(x => x.id === pid);
  if (!p) return;
  const dr = p.diasRestantes;
  const diasRetraso = dr < 0 ? Math.abs(dr) : 0;
  const monto = diasRetraso * 1.00;
  const tipo = diasRetraso > 0 ? "alert-warning" : "alert-info";
  infoEl.style.display = "block";
  infoEl.innerHTML = `
    <div class="alert ${tipo}">
      <span class="alert-icon">${diasRetraso > 0 ? "⚠️" : "ℹ️"}</span>
      <div>
        <strong>${p.usuario}</strong> — "${p.libro}"<br/>
        <small>Vence: ${fmtFecha(p.vencimiento)}</small><br/>
        ${diasRetraso > 0
          ? `<strong>Retraso: ${diasRetraso} día(s) — Multa: S/ ${monto.toFixed(2)}</strong>`
          : "Sin retraso — no se genera multa"}
      </div>
    </div>`;
}

async function registrarDevolucion() {
  const pid     = document.getElementById("dev-select").value;
  const resEl   = document.getElementById("dev-resultado");
  if (!pid) { resEl.innerHTML = alertHtml("Selecciona un préstamo."); return; }

  try {
    const data = await api("/devoluciones", "POST", { prestamoId: pid });
    if (data.multa) {
      resEl.innerHTML = alertHtml(
        `Devolución registrada con retraso. Multa generada: S/ ${data.multa.monto.toFixed(2)} — ID: ${data.multa.id}`,
        "warning"
      );
      toast(`Multa generada: S/ ${data.multa.monto.toFixed(2)}`, "warning");
    } else {
      resEl.innerHTML = alertHtml("Devolución registrada correctamente. Sin multa.", "success");
      toast("Devolución registrada.");
    }
    document.getElementById("dev-info").style.display = "none";
    await renderDevolucion();
    updateBadges();
  } catch (e) {
    resEl.innerHTML = alertHtml(e.message);
  }
}

// ══════════════════════════════════════════════
// ALERTAS
// ══════════════════════════════════════════════
async function renderAlertas() {
  const data = await api("/alertas");
  const cont = document.getElementById("alertas-container");
  let html = "";

  if (data.vencidos.length) {
    html += `<div class="card" style="margin-bottom:1rem;">
      <div class="card-header"><h3>🔴 Préstamos vencidos</h3><span>${data.vencidos.length} préstamo(s)</span></div>
      <table><thead><tr><th>ID</th><th>Usuario</th><th>Libro</th><th>Venció</th><th>Días retraso</th></tr></thead><tbody>` +
      data.vencidos.map(p =>
        `<tr><td>${p.id}</td><td>${p.usuario}</td><td>${p.libro}</td>
         <td>${fmtFecha(p.vencimiento)}</td>
         <td><span style="color:#dc2626;font-weight:600">${Math.abs(p.diasRestantes)} días</span></td></tr>`
      ).join("") + `</tbody></table></div>`;
  }

  if (data.proximos.length) {
    html += `<div class="card">
      <div class="card-header"><h3>⏰ Próximos a vencer (≤ 3 días)</h3><span>${data.proximos.length} préstamo(s)</span></div>
      <table><thead><tr><th>ID</th><th>Usuario</th><th>Libro</th><th>Vence</th><th>Días restantes</th></tr></thead><tbody>` +
      data.proximos.map(p =>
        `<tr><td>${p.id}</td><td>${p.usuario}</td><td>${p.libro}</td>
         <td>${fmtFecha(p.vencimiento)}</td>
         <td><span style="color:#d97706;font-weight:600">${p.diasRestantes} día(s)</span></td></tr>`
      ).join("") + `</tbody></table></div>`;
  }

  if (!data.vencidos.length && !data.proximos.length) {
    html = `<div class="card"><div class="card-body"><div class="empty"><div class="empty-icon">✅</div><h4>Sin alertas</h4><p>Todos los préstamos están al día.</p></div></div></div>`;
  }

  cont.innerHTML = html;
}

// ══════════════════════════════════════════════
// MULTAS
// ══════════════════════════════════════════════
async function renderMultas() {
  const multas = await api("/multas");
  const tb = document.getElementById("tabla-multas");
  tb.innerHTML = multas.length
    ? [...multas].reverse().map(m => `
        <tr>
          <td><strong>${m.id}</strong></td><td>${m.prestamoId}</td>
          <td>${m.diasRetraso} día(s)</td><td>S/ ${m.monto.toFixed(2)}</td>
          <td>${m.pagada
            ? '<span class="badge badge-activo">Pagada</span>'
            : '<span class="badge badge-pendiente">Pendiente</span>'}</td>
          <td>${!m.pagada
            ? `<button class="btn btn-success btn-sm" onclick="pagarMulta('${m.id}')">✓ Pagar</button>`
            : "—"}</td>
        </tr>`).join("")
    : empty("Sin multas registradas");
}

async function pagarMulta(id) {
  try {
    await api(`/multas/${id}/pagar`, "POST");
    renderMultas();
    updateBadges();
    toast(`Multa ${id} pagada.`);
  } catch (e) {
    toast(e.message, "error");
  }
}

// ══════════════════════════════════════════════
// HISTORIAL
// ══════════════════════════════════════════════
async function renderHistorial() {
  const historial = await api("/historial");
  const tb = document.getElementById("tabla-historial");
  tb.innerHTML = historial.length
    ? [...historial].reverse().map(h => `
        <tr>
          <td><strong>${h.id}</strong></td>
          <td style="font-size:.8rem">${h.detalle}</td>
          <td>${h.conMulta
            ? '<span class="badge badge-vencido">Con multa</span>'
            : '<span class="badge badge-activo">Sin multa</span>'}</td>
        </tr>`).join("")
    : empty("Sin registros en el historial");
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.getElementById("topbar-date").textContent =
  new Date().toLocaleDateString("es-PE", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });

renderDashboard();
updateBadges();