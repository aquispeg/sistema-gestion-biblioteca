import {Prestamo} from "./prestamo";
import {EstadoPrestamo} from "./index";

export abstract class Usuario {

  protected prestamos: Prestamo[] = [];

  protected readonly id: string;
  protected nombre: string;

  constructor(id: string, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  abstract getMaxPrestamos(): number;

  puedeSolicitarPrestamo(): boolean {
    const activos = this.prestamos.filter(
      p => p.getEstado() === EstadoPrestamo.ACTIVO
    );

    return activos.length < this.getMaxPrestamos();
  }
  tienePrestamoActivoDeLibro(libroId: string): boolean {
  return this.prestamos.some(
    p => p.getEstado() === EstadoPrestamo.ACTIVO &&
         p.getLibro().getId() === libroId
    );
  }

  agregarPrestamo(prestamo: Prestamo): void {
    this.prestamos.push(prestamo);
  }

  getId(): string {
    return this.id;
  }

  getNombre(): string {
    return this.nombre;
  }
}

// ===============================

export class Estudiante extends Usuario {

  constructor(
    id: string,
    nombre: string,
    private nivel: "PRIMARIA" | "SECUNDARIA"
  ) {
    super(id, nombre);
  }

  getMaxPrestamos(): number {
    return this.nivel === "PRIMARIA" ? 2 : 3;
  }
}

// ===============================

export class Docente extends Usuario {

  getMaxPrestamos(): number {
    return 5;
  }
}