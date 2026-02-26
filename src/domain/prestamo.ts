import {EstadoPrestamo} from "./enums/index";
import {Ejemplar} from "./ejemplar";
import {Libro} from "./libro";
import {Usuario} from "./Usuario";

export class Prestamo{
    private static contador= 1;
    private id:string;
    private estado:EstadoPrestamo=EstadoPrestamo.ACTIVO;
    private fechaIni:Date;
    private fechaVen: Date;
    
    constructor(private usuario:Usuario,private libro: Libro, private ejemplar:Ejemplar){
        this.id = `PRE-${Prestamo.contador++}`;
        this.fechaIni = new Date();
        const dias = this.libro.getDiasMaxPrestamo();
        this.fechaVen = new Date(this.fechaIni);
        this.fechaVen.setDate(this.fechaVen.getDate() + dias);
        this.ejemplar.prestar();
    }
    getId():string{
        return this.id;
    }
    getLibro(): Libro {
        return this.libro;
    }
    getUsuario(): Usuario {
       return this.usuario;
    }
    estaActivo(): boolean {
        return this.estado === EstadoPrestamo.ACTIVO;
    }
    verificarVencimiento(): void {
        if (this.estado === EstadoPrestamo.ACTIVO && new Date() > this.fechaVen) {
            this.estado = EstadoPrestamo.VENCIDO;
        }
    }
    devolver(): void {
        if (this.estado === EstadoPrestamo.DEVUELTO) {
            throw new Error("El préstamo ya fue devuelto");
        }

        this.estado = EstadoPrestamo.DEVUELTO;
        this.ejemplar.devolver();
    }

    getEstado(): EstadoPrestamo {
        return this.estado;
  }
}
