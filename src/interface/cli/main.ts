import * as readline from "readline";
import { PersistenciaService } from "../../application/PersistenciaService";
import { StreamReader } from "../../infrastructure/storage/StreamReader";
import { FileIO } from "../../infrastructure/storage/FileIO";
import { LibroDTO, UsuarioDTO, PrestamoDTO, MultaDTO } from "../../infrastructure/storage/DTOs";

// ================================================
// CONFIGURACIÓN CONSOLA
// ================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function preguntar(texto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(texto, (r) => resolve(r.trim()));
  });
}

const db = new PersistenciaService();

// ================================================
// OPCIONES
// ================================================

async function registrarLibro(): Promise<void> {
  console.log("\n--- REGISTRAR LIBRO ---");
  const id     = await preguntar("ID (ej: L5): ");
  const titulo = await preguntar("Título: ");
  const autor  = await preguntar("Autor: ");

  console.log("Categorías: 1.Ficción  2.Ciencia  3.Historia  4.Matemáticas  5.Literatura  6.Revista");
  const opCat = await preguntar("Elige categoría (1-6): ");

  const categorias: Record<string, { enum: string; nombre: string }> = {
    "1": { enum: "FICCION",     nombre: "Ficción"      },
    "2": { enum: "CIENCIA",     nombre: "Ciencia"      },
    "3": { enum: "HISTORIA",    nombre: "Historia"     },
    "4": { enum: "MATEMATICAS", nombre: "Matemáticas"  },
    "5": { enum: "LITERATURA",  nombre: "Literatura"   },
    "6": { enum: "REVISTA",     nombre: "Revista"      },
  };

  const cat = categorias[opCat];
  if (!cat) { console.log("Categoría inválida."); return; }

  const dias = parseInt(await preguntar("Días máx. de préstamo: "));
  const prestableStr = await preguntar("¿Es prestable? (s/n): ");
  const prestable = prestableStr.toLowerCase() === "s";

  const nEj = parseInt(await preguntar("¿Cuántos ejemplares? "));
  const ejemplares = [];
  for (let i = 1; i <= nEj; i++) {
    const cod = await preguntar(`  Código ejemplar ${i}: `);
    ejemplares.push({ codigo: cod, estado: "DISPONIBLE" });
  }

  const libro: LibroDTO = {
    id, titulo, autor,
    categoriaEnum: cat.enum,
    categoriaNombre: cat.nombre,
    diasMaxPrestamo: isNaN(dias) ? 7 : dias,
    prestable,
    ejemplares,
  };

  try {
    await db.agregarLibro(libro);
    console.log(`✔ Libro "${titulo}" guardado en libros.json`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

async function registrarUsuario(): Promise<void> {
  console.log("\n--- REGISTRAR USUARIO ---");
  const id     = await preguntar("ID (ej: U4): ");
  const nombre = await preguntar("Nombre completo: ");

  console.log("Tipo: 1.Estudiante Primaria  2.Estudiante Secundaria  3.Docente");
  const tipo = await preguntar("Elige tipo (1-3): ");

  const tipos: Record<string, string> = {
    "1": "PRIMARIA", "2": "SECUNDARIA", "3": "DOCENTE",
  };
  const tipoStr = tipos[tipo];
  if (!tipoStr) { console.log(" Tipo inválido."); return; }

  const usuario: UsuarioDTO = { id, nombre, tipo: tipoStr };

  try {
    await db.agregarUsuario(usuario);
    console.log(`✔ Usuario "${nombre}" guardado en usuarios.json`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

async function realizarPrestamo(): Promise<void> {
  console.log("\n--- REALIZAR PRÉSTAMO ---");

  const libros   = await db.cargarLibros();
  const usuarios = await db.cargarUsuarios();
  const prestamosActivos = (await db.cargarPrestamos()).filter(p => p.estado === "ACTIVO");

  const usuarioId = await preguntar("ID del usuario: ");
  const libroId   = await preguntar("ID del libro: ");

  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario) { console.log("Usuario no encontrado."); return; }

  const libro = libros.find(l => l.id === libroId);
  if (!libro) { console.log("Libro no encontrado."); return; }

  if (!libro.prestable) { console.log("Este libro es de referencia y no se puede prestar."); return; }

  // Verificar multa pendiente
  const multas = await db.cargarMultas();
  const multaPendiente = multas.find(m => m.usuarioNombre === usuario.nombre && !m.pagada);
  if (multaPendiente) {
    console.log(`${usuario.nombre} tiene una multa pendiente de S/ ${multaPendiente.monto.toFixed(2)}. Debe pagarla primero.`);
    return;
  }

  // Verificar límite de préstamos
  const maxPrestamos = usuario.tipo === "PRIMARIA" ? 2 : usuario.tipo === "SECUNDARIA" ? 2 : 5;
  const prestamosUsuario = prestamosActivos.filter(p => p.usuarioId === usuarioId);
  if (prestamosUsuario.length >= maxPrestamos) {
    console.log(`${usuario.nombre} alcanzó el límite de ${maxPrestamos} préstamo(s).`);
    return;
  }

  // Verificar duplicado
  if (prestamosUsuario.some(p => p.libroId === libroId)) {
    console.log("El usuario ya tiene este libro prestado.");
    return;
  }

  // Buscar ejemplar disponible
  const ejemplar = libro.ejemplares.find(e => e.estado === "DISPONIBLE");
  if (!ejemplar) { console.log("No hay ejemplares disponibles."); return; }

  // Crear préstamo
  const ahora = new Date();
  const vencimiento = new Date(ahora);
  vencimiento.setDate(vencimiento.getDate() + libro.diasMaxPrestamo);

  const id = `PRE-${Date.now()}`;
  const prestamo: PrestamoDTO = {
    id,
    usuarioId,
    usuarioNombre: usuario.nombre,
    libroId,
    tituloLibro: libro.titulo,
    ejemplarCodigo: ejemplar.codigo,
    fechaInicio: ahora.toISOString(),
    fechaVencimiento: vencimiento.toISOString(),
    estado: "ACTIVO",
  };

  // Marcar ejemplar como prestado
  ejemplar.estado = "PRESTADO";
  const todosLibros = await db.cargarLibros();
  const libroIndex = todosLibros.findIndex(l => l.id === libroId);
  todosLibros[libroIndex] = libro;
  await db.guardarLibros(todosLibros);

  await db.agregarPrestamo(prestamo);
  console.log(`✔ Préstamo creado: ${id}`);
  console.log(`  Vence: ${vencimiento.toLocaleDateString("es-PE")}`);
}

async function devolverLibro(): Promise<void> {
  console.log("\n--- DEVOLVER LIBRO ---");

  const prestamos = await db.cargarPrestamos();
  const activos = prestamos.filter(p => p.estado === "ACTIVO");

  if (activos.length === 0) { console.log("No hay préstamos activos."); return; }

  console.log("Préstamos activos:");
  activos.forEach(p => {
    const vence = new Date(p.fechaVencimiento);
    const dias = Math.ceil((vence.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const aviso = dias < 0 ? ` ⚠ VENCIDO (${Math.abs(dias)} días)` : ` (${dias} días restantes)`;
    console.log(`  ${p.id} | ${p.usuarioNombre} | "${p.tituloLibro}"${aviso}`);
  });

  const prestamoId = await preguntar("ID del préstamo a devolver: ");
  const prestamo = activos.find(p => p.id === prestamoId);
  if (!prestamo) { console.log("Préstamo no encontrado."); return; }

  // Calcular días de retraso
  const vencimiento = new Date(prestamo.fechaVencimiento);
  const diasRetraso = Math.max(0, Math.ceil((Date.now() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)));

  // Generar multa si hay retraso
  if (diasRetraso > 0) {
    const monto = diasRetraso * 0.50;
    const multa: MultaDTO = {
      id: `MUL-${Date.now()}`,
      prestamoId,
      usuarioNombre: prestamo.usuarioNombre,
      tituloLibro: prestamo.tituloLibro,
      diasRetraso,
      monto,
      pagada: false,
    };
    await db.agregarMulta(multa);
    console.log(`⚠  Devolución con ${diasRetraso} día(s) de retraso.`);
    console.log(`   Multa generada: S/ ${monto.toFixed(2)} — ID: ${multa.id}`);
  } else {
    console.log("✔ Devolución sin retraso. Sin multa.");
  }

  // Marcar ejemplar como disponible
  const libros = await db.cargarLibros();
  const libro = libros.find(l => l.id === prestamo.libroId);
  if (libro) {
    const ej = libro.ejemplares.find(e => e.codigo === prestamo.ejemplarCodigo);
    if (ej) ej.estado = "DISPONIBLE";
    await db.guardarLibros(libros);
  }

  await db.actualizarEstadoPrestamo(prestamoId, diasRetraso > 0 ? "VENCIDO" : "DEVUELTO");
  console.log("✔ Devolución registrada.");
}

async function listarPrestamos(): Promise<void> {
  console.log("\n--- PRÉSTAMOS ---");
  const prestamos = await db.cargarPrestamos();
  if (prestamos.length === 0) { console.log("No hay préstamos registrados."); return; }

  prestamos.forEach(p => {
    const vence = new Date(p.fechaVencimiento);
    const dias = Math.ceil((vence.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const diasStr = p.estado === "ACTIVO"
      ? (dias < 0 ? `VENCIDO ${Math.abs(dias)} días` : `${dias} días restantes`)
      : p.estado;
    console.log(`  [${p.id}] ${p.usuarioNombre} | "${p.tituloLibro}" | ${diasStr}`);
  });
}

async function listarLibros(): Promise<void> {
  console.log("\n--- LIBROS REGISTRADOS ---");
  const libros = await db.cargarLibros();
  if (libros.length === 0) { console.log("No hay libros registrados."); return; }

  libros.forEach(l => {
    const disponibles = l.ejemplares.filter(e => e.estado === "DISPONIBLE").length;
    console.log(`  [${l.id}] "${l.titulo}" - ${l.autor} | ${l.categoriaNombre} | Disponibles: ${disponibles}/${l.ejemplares.length}`);
  });
}

async function verMultas(): Promise<void> {
  console.log("\n--- MULTAS ---");
  const multas = await db.cargarMultas();
  if (multas.length === 0) { console.log("No hay multas registradas."); return; }

  multas.forEach(m => {
    const estado = m.pagada ? "PAGADA" : "PENDIENTE";
    console.log(`  [${m.id}] ${m.usuarioNombre} | "${m.tituloLibro}" | S/ ${m.monto.toFixed(2)} | ${estado}`);
  });

  const pendientes = multas.filter(m => !m.pagada);
  if (pendientes.length === 0) return;

  const pagar = await preguntar("\n¿Deseas pagar una multa? (s/n): ");
  if (pagar.toLowerCase() !== "s") return;

  const multaId = await preguntar("ID de la multa: ");
  try {
    await db.pagarMulta(multaId);
    console.log("Multa pagada.");
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

async function verLog(): Promise<void> {
  console.log("\n--- AUDITORÍA (log) ---");
  const contenido = await db.verLog();
  console.log(contenido);
}

async function experimentoStreams(): Promise<void> {
  console.log("\n--- EXPERIMENTO STREAMS ---");

  // Generar archivo grande de prueba
  console.log("Generando archivo grande (data/grande.txt)...");
  let contenido = "";
  for (let i = 0; i < 50000; i++) {
    contenido += `Línea ${i + 1} - registro de biblioteca escolar...\n`;
  }
  await FileIO.escribirTexto("data/grande.txt", contenido);
  console.log("Archivo generado.");

  // Lectura bloqueante (todo de una vez)
  console.log("\n1. Lectura BLOQUEANTE (readFileSync):");
  const inicio1 = Date.now();
  const data = require("fs").readFileSync("data/grande.txt", { encoding: "utf-8" });
  console.log(`   Leído: ${data.length} caracteres en ${Date.now() - inicio1}ms`);

  // Lectura por stream (chunks)
  console.log("\n2. Lectura por STREAM (chunks de 64KB):");
  const inicio2 = Date.now();
  const totalBytes = await StreamReader.leerPorChunks("data/grande.txt");
  console.log(`   Total: ${totalBytes} bytes en ${Date.now() - inicio2}ms`);

  // Lectura parcial (primeros 200 bytes)
  console.log("\n3. Lectura PARCIAL (primeros 200 bytes):");
  const parcial = await StreamReader.leerParcial("data/grande.txt", 200);
  console.log(`   "${parcial.replace(/\n/g, " ").substring(0, 100)}..."`);

  await db.registrarLog("EXPERIMENTO STREAMS ejecutado");
}

// ================================================
// MENÚ PRINCIPAL
// ================================================

function mostrarMenu(): void {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║    SISTEMA DE GESTIÓN BIBLIOTECA     ║");
  console.log("║         (con persistencia JSON)      ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  1. Registrar libro                  ║");
  console.log("║  2. Registrar usuario                ║");
  console.log("║  3. Realizar préstamo                ║");
  console.log("║  4. Devolver libro                   ║");
  console.log("║  5. Listar libros                    ║");
  console.log("║  6. Listar préstamos                 ║");
  console.log("║  7. Ver multas                       ║");
  console.log("║  8. Ver auditoría (log)              ║");
  console.log("║  9. Experimento Streams              ║");
  console.log("║  0. Salir                            ║");
  console.log("╚══════════════════════════════════════╝");
}

async function iniciar(): Promise<void> {
  console.log("\n Sistema iniciado — datos persistidos en carpeta /data");
  console.log("   Los datos se guardan automáticamente en archivos JSON.");

  let activo = true;
  while (activo) {
    mostrarMenu();
    const opcion = await preguntar("\nElige una opción: ");

    switch (opcion) {
      case "1": await registrarLibro();       break;
      case "2": await registrarUsuario();     break;
      case "3": await realizarPrestamo();     break;
      case "4": await devolverLibro();        break;
      case "5": await listarLibros();         break;
      case "6": await listarPrestamos();      break;
      case "7": await verMultas();            break;
      case "8": await verLog();               break;
      case "9": await experimentoStreams();   break;
      case "0":
        await db.registrarLog("SISTEMA cerrado");
        console.log("\n Hasta luego. Datos guardados en /data");
        activo = false;
        break;
      default:
        console.log("Opción inválida.");
    }
  }

  rl.close();
}

iniciar();