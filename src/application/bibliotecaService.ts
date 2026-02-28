import { Usuario } from "../domain/Usuario";
import { Libro } from "../domain/libro";
import { Prestamo } from "../domain/prestamo";
import { Ejemplar } from "../domain/ejemplar";
import { Multa} from "../domain/multa";
import {HistorialPrestamo} from "../domain/historialprestamo";
import {EstadoPrestamo} from "../domain/enums/index";

export class BibliotecaService {

  private usuarios: Usuario[] = [];
  private libros: Libro[] = [];
  private prestamos: Prestamo[] = [];
  private multas: Multa[] = [];
  private historial: HistorialPrestamo[] = [];

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
    const multaPendiente = this.multas.find(
      m => m.getPrestamoId().startsWith(usuarioId) && !m.isPagada()
    );
    if (multaPendiente) {
      throw new Error(`El usuario tiene una multa pendiente de S/ ${multaPendiente.getMonto().toFixed(2)}. Debe pagarla antes de solicitar un préstamo.`);
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

  devolverLibro(prestamoId: string): Multa | null{
    const prestamo = this.prestamos.find(p => p.getId() === prestamoId);

    if (!prestamo) {
      throw new Error("Préstamo no encontrado");
    }
    prestamo.verificarVencimiento();
    const diasRetraso = prestamo.getDiasRetraso();
    let multa: Multa | null = null;

    // Generar multa automática si hay retraso
    if (diasRetraso > 0) {
      multa = new Multa(
        `${prestamo.getUsuario().getId()}-${prestamoId}`,
        prestamo.getUsuario().getNombre(),
        prestamo.getLibro().getTitulo(),
        diasRetraso
      );
      this.multas.push(multa);
    }

    // Registrar en historial
    const registro = new HistorialPrestamo(
      prestamo.getId(),
      prestamo.getUsuario().getId(),
      prestamo.getUsuario().getNombre(),
      prestamo.getLibro().getId(),
      prestamo.getLibro().getTitulo(),
      prestamo.getFechaInicio(),
      prestamo.getFechaVencimiento(),
      diasRetraso > 0 ? EstadoPrestamo.VENCIDO : EstadoPrestamo.DEVUELTO,
      diasRetraso > 0
    );
    this.historial.push(registro);
    prestamo.devolver();
    return multa;
  }

  // ==============================
  // PAGAR MULTA
  // ==============================

  pagarMulta(multaId: string): void {
    const multa = this.multas.find(m => m.getId() === multaId);
    if (!multa) throw new Error("Multa no encontrada");
    multa.pagar();
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
  getAlertasVencimiento(diasUmbral: number = 3): Prestamo[] {
    this.verificarVencimientos();
    return this.prestamos.filter(p => {
      const dias = p.getDiasRestantes();
      return p.getEstado() === EstadoPrestamo.ACTIVO && dias <= diasUmbral;
    });
  }

  getPrestamosvencidos(): Prestamo[] {
    this.verificarVencimientos();
    return this.prestamos.filter(p => p.getEstado() === EstadoPrestamo.VENCIDO);
  }

  // ==============================
  // HISTORIAL Y MULTAS
  // ==============================

  listarMultas(): Multa[] {
    return this.multas;
  }

  listarHistorial(): HistorialPrestamo[] {
    return this.historial;
  }

  listarHistorialPorUsuario(usuarioId: string): HistorialPrestamo[] {
    return this.historial.filter(h => h.getUsuarioId() === usuarioId);
  }

  listarHistorialPorLibro(libroId: string): HistorialPrestamo[] {
    return this.historial.filter(h => h.getLibro() === libroId);
  }

}

