//Simulacion del sistema
import * as readline from "readline";
import {BibliotecaService} from "../../application/bibliotecaService";
import {Categoria} from "../../domain/categoLibro";
import {Libro} from "../../domain/libro";
import {Ejemplar} from "../../domain/ejemplar";
import {Estudiante,Docente} from "../../domain/Usuario";
import {CategoriaLibro} from "../../domain/enums/index"; 

// ================================================
// CONFIGURACIÓN DE LECTURA DE CONSOLA
// ================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función auxiliar para leer input del usuario
function preguntar(texto: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      resolve(respuesta.trim());
    });
  });
}

// ================================================
// SISTEMA INICIALIZADO CON DATOS DE EJEMPLO
// ================================================

const sistema = new BibliotecaService();

// Categorías precargadas
const catFiccion   = new Categoria("Ficción",      CategoriaLibro.FICCION,      7,  true);
const catCiencia   = new Categoria("Ciencia",       CategoriaLibro.CIENCIA,      7,  true);
const catLiteratura= new Categoria("Literatura",    CategoriaLibro.LITERATURA,   14, true);
const catReferencia= new Categoria("Referencia",    CategoriaLibro.HISTORIA,     0,  false);

// Libros precargados
const libro1 = new Libro("L1", "El Principito",         catFiccion,    "Antoine de Saint-Exupéry");
libro1.agregarEjemplar(new Ejemplar("E1"));
libro1.agregarEjemplar(new Ejemplar("E2"));

const libro2 = new Libro("L2", "Breve Historia del Tiempo", catCiencia, "Stephen Hawking");
libro2.agregarEjemplar(new Ejemplar("E3"));

const libro3 = new Libro("L3", "Cien Años de Soledad",  catLiteratura, "Gabriel García Márquez");
libro3.agregarEjemplar(new Ejemplar("E4"));
libro3.agregarEjemplar(new Ejemplar("E5"));

const libro4 = new Libro("L4", "Enciclopedia Universal", catReferencia, "Varios");
libro4.agregarEjemplar(new Ejemplar("E6"));

sistema.registrarLibro(libro1);
sistema.registrarLibro(libro2);
sistema.registrarLibro(libro3);
sistema.registrarLibro(libro4);

// Usuarios precargados
sistema.registrarUsuario(new Estudiante("U1", "Ana García",    "PRIMARIA"));
sistema.registrarUsuario(new Estudiante("U2", "Luis Torres",   "SECUNDARIA"));
sistema.registrarUsuario(new Docente   ("U3", "Carlos Mendoza"));

// ================================================
// FUNCIONES DEL MENÚ
// ================================================

async function registrarLibro(): Promise<void> {
  console.log("\n--- REGISTRAR LIBRO ---");

  const id     = await preguntar("ID del libro (ej: L5): ");
  const titulo = await preguntar("Título: ");
  const autor  = await preguntar("Autor: ");

  console.log("Categorías disponibles:");
  console.log("  1. Ficción     2. Ciencia");
  console.log("  3. Literatura  4. Referencia (no prestable)");
  const opCat = await preguntar("Elige categoría (1-4): ");

  const categorias: Record<string, Categoria> = {
    "1": catFiccion,
    "2": catCiencia,
    "3": catLiteratura,
    "4": catReferencia,
  };

  const categoria = categorias[opCat];
  if (!categoria) {
    console.log("Categoría inválida.");
    return;
  }

  const libro = new Libro(id, titulo, categoria, autor);

  const numEjemplares = await preguntar("¿Cuántos ejemplares deseas agregar? ");
  const cantidad = parseInt(numEjemplares);

  if (isNaN(cantidad) || cantidad <= 0) {
    console.log("❌ Cantidad inválida.");
    return;
  }

  for (let i = 1; i <= cantidad; i++) {
    const codigoEj = await preguntar(`  Código del ejemplar ${i}: `);
    libro.agregarEjemplar(new Ejemplar(codigoEj));
  }

  sistema.registrarLibro(libro);
  console.log(`✔ Libro "${titulo}" registrado con ${cantidad} ejemplar(es).`);
}

async function registrarUsuario(): Promise<void> {
  console.log("\n--- REGISTRAR USUARIO ---");

  const id     = await preguntar("ID del usuario (ej: U4): ");
  const nombre = await preguntar("Nombre completo: ");

  console.log("Tipo de usuario:");
  console.log("  1. Estudiante Primaria   (máx. 2 préstamos)");
  console.log("  2. Estudiante Secundaria (máx. 2 préstamos)");
  console.log("  3. Docente               (máx. 5 préstamos)");
  const tipo = await preguntar("Elige tipo (1-3): ");

  if (tipo === "1") {
    sistema.registrarUsuario(new Estudiante(id, nombre, "PRIMARIA"));
  } else if (tipo === "2") {
    sistema.registrarUsuario(new Estudiante(id, nombre, "SECUNDARIA"));
  } else if (tipo === "3") {
    sistema.registrarUsuario(new Docente(id, nombre));
  } else {
    console.log("Tipo inválido.");
    return;
  }

  console.log(`✔ Usuario "${nombre}" registrado.`);
}

async function realizarPrestamo(): Promise<void> {
  console.log("\n--- REALIZAR PRÉSTAMO ---");

  const usuarioId = await preguntar("ID del usuario: ");
  const libroId   = await preguntar("ID del libro: ");

  try {
    const prestamo = sistema.realizarPrestamo(usuarioId, libroId);
    console.log(`✔ Préstamo creado exitosamente.`);
    console.log(`  ID Préstamo : ${prestamo.getId()}`);
    console.log(`  Estado      : ${prestamo.getEstado()}`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

async function devolverLibro(): Promise<void> {
  console.log("\n--- DEVOLVER LIBRO ---");

  // Mostrar préstamos activos para ayudar al usuario
  const activos = sistema.listarPrestamos().filter(
    (p) => p.getEstado() === "ACTIVO"
  );

  if (activos.length === 0) {
    console.log("No hay préstamos activos en este momento.");
    return;
  }

  console.log("Préstamos activos:");
  activos.forEach((p) => {
    console.log(`  ID: ${p.getId()} | Usuario: ${p.getUsuario().getNombre()} | Libro: ${p.getLibro().getTitulo()}`);
  });

  const prestamoId = await preguntar("ID del préstamo a devolver: ");

  try {
    sistema.devolverLibro(prestamoId);
    console.log(`✔ Devolución registrada correctamente.`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

function listarPrestamos(): void {
  console.log("\n--- LISTA DE PRÉSTAMOS ---");

  const prestamos = sistema.listarPrestamos();

  if (prestamos.length === 0) {
    console.log("No hay préstamos registrados.");
    return;
  }

  prestamos.forEach((p) => {
    console.log(
      `  [${p.getId()}]` +
      ` Usuario: ${p.getUsuario().getNombre()}` +
      ` | Libro: ${p.getLibro().getTitulo()}` +
      ` | Estado: ${p.getEstado()}`
    );
  });
}