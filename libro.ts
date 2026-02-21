import {RecursoBiblioteca} from "./recursoBiblioteca";
import {Ejemplar} from "./ejemplar";
import {EstadoEjemplar} from "./index";
import {Categoria} from "./categoLibro";

export class Libro extends RecursoBiblioteca{
    private ejemplares:Ejemplar[]=[];

    constructor(id:string, titulo:string,categoria:Categoria, public autor:string){
        super(id, titulo, categoria);
    }

    agregarEjemplar(ejemplar: Ejemplar): void {
    this.ejemplares.push(ejemplar);
  }

    obtenerEjemplarDisponible(): Ejemplar | undefined {
    return this.ejemplares.find(
      e => e.estado === EstadoEjemplar.DISPONIBLE
    );
  }

  esPrestable(): boolean {
    return this.categoria.esPrestable() &&
           this.obtenerEjemplarDisponible() !== undefined;
  }
}
    
