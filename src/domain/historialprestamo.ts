import {EstadoPrestamo} from "./enums/index";

export class HistorialPrestamo{
    private static contador= 1;
    private id: string;
    private fechaDevolucion: Date;
    constructor(
        private prestamoId:string,
        private usuarioId:string,
        private usuarioNombre:string,
        private libroId:string,
        private tituloLibro:string,
        private fechaInicio:Date,
        private fechaVencimiento:Date,
        private estadoFinal:EstadoPrestamo,
        private multaGenerada:boolean=false
    ){
       this.id = `HIS-${HistorialPrestamo.contador++}`;
        this.fechaDevolucion = new Date(); 
    }
    getId():string{
        return this.id;
    }
    getUsuarioId(){
        return this.usuarioId;
    }
    getLibro():string{
        return this.libroId;
    }
    getMultaGenerada():boolean{
        return this.multaGenerada;
    }
    toString(): string {
        const multa = this.multaGenerada ? " CON MULTA" : "";
        return (
            `[${this.id}] ${this.usuarioNombre} | ` +
            `"${this.tituloLibro}" | ` +
            `Inicio: ${this.fechaInicio.toLocaleDateString("es-PE")} | ` +
            `Venció: ${this.fechaVencimiento.toLocaleDateString("es-PE")} | ` +
            `Devuelto: ${this.fechaDevolucion.toLocaleDateString("es-PE")} | ` +
            `Estado: ${this.estadoFinal}${multa}`
        );
    }

}