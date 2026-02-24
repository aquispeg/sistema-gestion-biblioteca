import { Usuario } from "./Usuario";
import { Libro } from "./libro";
import { Prestamo } from "./prestamo";
import { Ejemplar } from "./ejemplar";

export class BibliotecaService {

  private usuarios: Usuario[] = [];
  private libros: Libro[] = [];
  private prestamos: Prestamo[] = [];

  // ==============================
  // REGISTROS
  // ==============================

  registrarUsuario(usuario: Usuario): void {
    this.usuarios.push(usuario);
  }

  registrarLibro(libro: Libro): void {
    this.libros.push(libro);
  }

  // ==============================
  // BÚSQUEDAS
  // ==============================

  buscarUsuario(id: string): Usuario | undefined {
    return this.usuarios.find(u => u.getId() === id);
  }

  buscarLibro(id: string): Libro | undefined {
    return this.libros.find(l => l.getId() === id);
  }

  // ==============================
  // PRÉSTAMO
  // ==============================

  realizarPrestamo(usuarioId: string, libroId: string): Prestamo {

    const usuario = this.buscarUsuario(usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const libro = this.buscarLibro(libroId);
    if (!libro) {
      throw new Error("Libro no encontrado");
    }

    if (!usuario.puedeSolicitarPrestamo()) {
      throw new Error("El usuario alcanzó el máximo de préstamos");
    }

    if (usuario.tienePrestamoActivoDeLibro(libro.getId())) {
      throw new Error("El usuario ya tiene este libro prestado");
    }

    if (!libro.esPrestable()) {
      throw new Error("El libro no tiene ejemplares disponibles");
    }

    const ejemplarDisponible: Ejemplar | undefined =
      libro.obtenerEjemplarDisponible();

    if (!ejemplarDisponible) {
      throw new Error("No hay ejemplares disponibles");
    }

    const prestamo = new Prestamo(usuario, libro, ejemplarDisponible);

    usuario.agregarPrestamo(prestamo);
    this.prestamos.push(prestamo);

    return prestamo;
  }

  // ==============================
  // DEVOLUCIÓN
  // ==============================

  devolverLibro(prestamoId: string): void {
    const prestamo = this.prestamos.find(p => p.getId() === prestamoId);

    if (!prestamo) {
      throw new Error("Préstamo no encontrado");
    }

    prestamo.devolver();
  }

  // ==============================
  // VERIFICAR VENCIMIENTOS
  // ==============================

  verificarVencimientos(): void {
    this.prestamos.forEach(p => p.verificarVencimiento());
  }

  // ==============================
  // CONSULTAS
  // ==============================

  listarPrestamos(): Prestamo[] {
    return this.prestamos;
  }

}

