import {CategoriaLibro} from "./index";

export abstract class RecursoBiblioteca{
    protected readonly id:string;
    titulo:string;
    categoria: CategoriaLibro;
    protected readonly fechaRegistro: Date;
    constructor(id:string,titulo:string, categoria: CategoriaLibro){
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

  getCategoria(): CategoriaLibro {
    return this.categoria;
  }

  getFechaRegistro(): Date {
    return this.fechaRegistro;
  }

  toString(): string {
    return `[${this.id}] ${this.titulo} - ${this.categoria.toString()}`;
  }
}