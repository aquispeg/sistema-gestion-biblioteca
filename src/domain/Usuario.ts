import {Prestamo} from "./prestamo";
import {EstadoPrestamo,TipoUsuario} from "./enums/index";

export abstract class Usuario {

  protected prestamos: Prestamo[] = [];
  protected readonly id: string;
  protected nombre: string;
  readonly tipousuario:TipoUsuario;

  constructor(id: string, nombre: string, tipousuario:TipoUsuario) {
    this.id = id;
    this.nombre = nombre;
    this.tipousuario=tipousuario;
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
  getTipoUsuario(): TipoUsuario {
    return this.tipousuario;
  }

  toString(): string {
    return `[${this.id}] ${this.nombre} (${this.tipousuario})`;
  }

}

// ===============================

export class Estudiante extends Usuario {
    constructor(id: string, nombre: string, grado: string) {
        super(id, nombre, grado === "PRIMARIA" 
            ? TipoUsuario.ESTUDIANTE_PRIMARIA 
            : TipoUsuario.ESTUDIANTE_SECUNDARIA
        );
    }
    getMaxPrestamos(): number { return 2; }
}

// ===============================

export class Docente extends Usuario {
    constructor(id: string, nombre: string) {
        super(id, nombre, TipoUsuario.DOCENTE);
    }
    getMaxPrestamos(): number { return 5; }
}