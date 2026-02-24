//Simulacion del sistema
import {BibliotecaService} from "./bibliotecaService";
import {Categoria} from "./categoLibro";
import {Libro} from "./libro";
import {Ejemplar} from "./ejemplar";
import {Estudiante,Docente} from "./Usuario";
import {Prestamo} from "./prestamo";


// =====================================
// INICIALIZAR SISTEMA
// =====================================

const sistema = new BibliotecaService();

console.log("===== SIMULACIÓN SISTEMA BIBLIOTECA =====\n");

// =====================================
// CREAR CATEGORÍAS
// =====================================

const catGeneral = new Categoria("General", 3, true);
const catReferencia = new Categoria("Referencia", 0, false);

// =====================================
// CREAR LIBROS
// =====================================

const libro1 = new Libro("L1", "El Principito", catGeneral, "Antoine");
libro1.agregarEjemplar(new Ejemplar("E1"));
libro1.agregarEjemplar(new Ejemplar("E2"));

const libro2 = new Libro("L2", "Enciclopedia", catReferencia, "Varios");
libro2.agregarEjemplar(new Ejemplar("E3"));

sistema.registrarLibro(libro1);
sistema.registrarLibro(libro2);

// =====================================
// CREAR USUARIOS
// =====================================

const estudiante = new Estudiante("U1", "Ana", "PRIMARIA");
const docente = new Docente("U2", "Carlos");

sistema.registrarUsuario(estudiante);
sistema.registrarUsuario(docente);

// =====================================
// SIMULACIÓN DE PRÉSTAMOS
// =====================================

console.log(" Ana solicita 'El Principito'");
const p1 = sistema.realizarPrestamo("U1", "L1");
console.log("Préstamo creado:", p1.getId());

console.log("\n Ana intenta pedir el mismo libro otra vez (debe fallar)");
try {
  sistema.realizarPrestamo("U1", "L1");
} catch (e: any) {
  console.log("Error esperado:", e.message);
}

console.log("\n Carlos (docente) solicita 'El Principito'");
const p2 = sistema.realizarPrestamo("U2", "L1");
console.log("Préstamo creado:", p2.getId());

console.log("\n Intentar prestar libro de referencia (no prestable)");
try {
  sistema.realizarPrestamo("U1", "L2");
} catch (e: any) {
  console.log("Error esperado:", e.message);
}

// =====================================
// MOSTRAR ESTADO ACTUAL
// =====================================

console.log("\n===== LISTA DE PRÉSTAMOS =====");
sistema.listarPrestamos().forEach(p => {
  console.log(
    "ID:", p.getId(),
    "| Estado:", p.getEstado()
  );
});

// =====================================
// DEVOLUCIÓN
// =====================================

console.log("\n Ana devuelve su libro");
sistema.devolverLibro(p1.getId());

console.log("\nEstado después de devolución:");
sistema.listarPrestamos().forEach(p => {
  console.log(
    "ID:", p.getId(),
    "| Estado:", p.getEstado()
  );
});

// =====================================
// VERIFICAR VENCIMIENTOS
// =====================================

console.log("\n Verificando vencimientos...");
sistema.verificarVencimientos();

console.log("\n===== FIN DE SIMULACIÓN =====");