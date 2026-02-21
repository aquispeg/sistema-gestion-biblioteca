import {CategoriaLibro} from "./index";
export class categoriaLibro{
    private static _contador =1;

    readonly id: string;
    nombre:string;
    CategoriaLibro: categoriaLibro;
    diasMaxPrestamo: number;

    constructor(nombre:string,CategoriaLibro: categoriaLibro,diasMaxPrestamo:number=3){
        this.id = `CAT- ${categoriaLibro._contador++}`;
        this.nombre=nombre;
        this.CategoriaLibro=CategoriaLibro;
        this.diasMaxPrestamo=diasMaxPrestamo;
    }
    esPrestable():boolean{
        return true;
        
    }
    toString():string{
        return `[${this.id}] ${this.nombre} (${this.CategoriaLibro}) - Máx. ${this.diasMaxPrestamo} días`;
    }
}