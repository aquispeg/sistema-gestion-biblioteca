import {EstadoEjemplar} from "./index";
export class Ejemplar {
    constructor(
        readonly codigo:string,
        private estado: EstadoEjemplar
    ){}
    getEstado(): EstadoEjemplar {
        return this.estado;
    }

    estaDisponible(): boolean {
        return this.estado === EstadoEjemplar.DISPONIBLE;
    }

    prestar():void{
        if(this.estado!==EstadoEjemplar.DISPONIBLE){
            throw new Error("Ejemplar no disponible");
        }
        this.estado=EstadoEjemplar.PRESTADO;
    }
    devolver():void{
        if(this.estado === EstadoEjemplar.DISPONIBLE){
          throw new Error("El ejemplar ya está disponible");
        }
        this.estado = EstadoEjemplar.DISPONIBLE;
    }
}