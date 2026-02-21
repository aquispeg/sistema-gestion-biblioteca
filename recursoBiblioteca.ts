import {Categoria} from "./categoLibro";

export abstract class RecursoBiblioteca{
    protected readonly id:string;
    protected titulo:string;
    protected categoria: Categoria;
    protected readonly fechaRegistro: Date;
    constructor(id:string,titulo:string, categoria: Categoria){
        this.id=id;
        this.titulo=titulo;
        this.categoria=categoria;
        this.fechaRegistro= new Date();
    }
    abstract esPrestable():boolean;

    getId(): string {
    return this.id;
  }

  getTitulo(): string {
    return this.titulo;
  }

  getCategoria(): Categoria {
    return this.categoria;
  }

  getFechaRegistro(): Date {
    return this.fechaRegistro;
  }

  toString(): string {
    return `[${this.id}] ${this.titulo} - ${this.categoria.toString()}`;
  }
}