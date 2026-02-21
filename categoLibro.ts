import {CategoriaLibro} from "./index";

export class Categoria{
    private static contador =1;
    readonly id: string;
    nombre:string;
    diasMaxPrestamo: number;
    private prestable: boolean;

    constructor(nombre:string,diasMaxPrestamo:number=3, prestable:boolean=true){
        this.id = `CAT- ${Categoria.contador++}`;
        this.nombre=nombre;
        this.diasMaxPrestamo=diasMaxPrestamo;
        this.prestable=prestable;

    }
    esPrestable():boolean{
        return this.prestable;

    }
    toString():string{
        return `[${this.id}] ${this.nombre} - Máx. ${this.diasMaxPrestamo} días`;
    }
}
