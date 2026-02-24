import {EstadoPrestamo} from "./index";
import {Ejemplar} from "./ejemplar";
import {Usuario} from "./Usuario"

export class Prestamo{
    private static contador= 1;
    private id:string;
    private estado:EstadoPrestamo=EstadoPrestamo.ACTIVO;
    private fechaVen: Date;
    constructor(private usuario:Usuario,public ejemplar:Ejemplar){
        this.id = `PRE-${Prestamo.contador++}`;
        this.fechaVen = new Date();
        this.fechaVen.setDate(this.fechaVen.getDate() + 3);
        this.ejemplar.prestar();
    }
    getId():string{
        return this.id;
    }
    verificarVenci():void{
        if(new Date()>this.fechaVen && this.estado === EstadoPrestamo.ACTIVO){
            this.estado=EstadoPrestamo.VENCIDO;
        }
    }
    devolver(): void {
        this.estado = EstadoPrestamo.DEVUELTO;
        this.ejemplar.devolver();
    }

    getEstado(): EstadoPrestamo {
        return this.estado;
  }
}
