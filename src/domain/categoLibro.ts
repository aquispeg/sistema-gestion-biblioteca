import {CategoriaLibro} from "./enums/index";
export class Categoria{
    private static contador =1;
    readonly id: string;
    private nombre:string;
    diasMaxPrestamo: number;
    categoria: CategoriaLibro
    private prestable: boolean;

    constructor(nombre:string,categoria:CategoriaLibro,diasMaxPrestamo:number=3, prestable:boolean=true){
        this.id = `CAT- ${Categoria.contador++}`;
        this.nombre=nombre;
        this.categoria=categoria;
        this.diasMaxPrestamo=diasMaxPrestamo;
        this.prestable=prestable;

    }
    getNombre(): string {
    return this.nombre;
    }

    getDiasMaxPrestamo(): number {
    return this.diasMaxPrestamo;
    }
    esPrestable():boolean{
        return this.prestable;

    }
    toString(): string {
        return `[${this.id}] ${this.nombre} (${this.categoria}) - Máx. ${this.diasMaxPrestamo} días`;
   }
}
