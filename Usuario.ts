import {Prestamo} from "./prestamo";
export abstract class Usuario {

  protected prestamos: Prestamo[] = [];

  constructor(
    protected readonly id: string,
    protected nombre: string
  ) {}

  abstract getMaxPrestamos(): number;

  puedeSolicitarPrestamo(): boolean {
    const activos = this.prestamos.filter(
      p => p.getEstado() === "ACTIVO"
    );

    return activos.length < this.getMaxPrestamos();
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