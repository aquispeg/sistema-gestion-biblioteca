import {EstadoEjemplar} from "./index";
export class Ejemplar {
    constructor(
        public codigo:string,
        public estado: EstadoEjemplar=EstadoEjemplar.DISPONIBLE
    ){}
    prestar():void{
        if(this.estado!==EstadoEjemplar.DISPONIBLE){
            throw new Error("Ejemplar no disponible");
        }
        this.estado=EstadoEjemplar.PRESTADO;
    }
    devolver():void{
        this.estado=EstadoEjemplar.DISPONIBLE;
    }
}