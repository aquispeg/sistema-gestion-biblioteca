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
    getFechaInicio(): Date { 
        return this.fechaIni; 
    }
    getFechaVencimiento(): Date { 
        return this.fechaVen; 
    }
    estaActivo(): boolean {
        return this.estado === EstadoPrestamo.ACTIVO;
    }
    getDiasRetraso(): number {
        const hoy = new Date();
        if (hoy <= this.fechaVen) return 0;
        const diff = hoy.getTime() - this.fechaVen.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    getDiasRestantes(): number {
        const hoy = new Date();
        const diff = this.fechaVen.getTime() - hoy.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
