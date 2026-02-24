import {RecursoBiblioteca} from "./recursoBiblioteca";
import {Ejemplar} from "./ejemplar";
import {EstadoEjemplar} from "./index";
import {Categoria} from "./categoLibro";

export class Libro extends RecursoBiblioteca{
    private ejemplares:Ejemplar[]=[];

    constructor(id:string, titulo:string,categoria:Categoria, private autor:string){
        super(id, titulo, categoria);
    }
    getAutor():string{
      return this.autor;
  }

    agregarEjemplar(ejemplar: Ejemplar): void {
    if (this.ejemplares.some(e => e.codigo === ejemplar.codigo)) {
        throw new Error("El ejemplar ya existe");
    }
    this.ejemplares.push(ejemplar);
  }

    obtenerEjemplarDisponible(): Ejemplar | undefined {
    return this.ejemplares.find(e => e.estaDisponible());
  }

  esPrestable(): boolean {
    return this.categoria.esPrestable() &&
           this.obtenerEjemplarDisponible() !== undefined;
  }
}
    
