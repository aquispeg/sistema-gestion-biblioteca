import {EstadoPrestamo} from "./index";
import {Ejemplar} from "./ejemplar";
export class Prestamo{
    private estado:EstadoPrestamo=EstadoPrestamo.ACTIVO;
    constructor(public ejemplar:Ejemplar, public fechaVen:Date){
        this.ejemplar.prestar();
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
