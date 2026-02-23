import {Libro} from "./libro";
import {Usuario} from "./Usuario";
import {Prestamo} from "./prestamo";
import {EstadoPrestamo} from "./index";
import {Ejemplar} from "./ejemplar";

export class BibliotecaService{
    private libros: Libro[]=[];
    private usuarios:Usuario[]=[];
    private prestamos:Prestamo[]=[];

//REGISTROS
registrarLibro(libro:Libro):void{
    this.libros.push(libro);
}
registrarUsuario(usuario:Usuario):void{
    this.usuarios.push(usuario);
}
// BÚSQUEDA
buscarLibroPorId(id:string):Libro | undefined{
    return this.libros.find(l => l.getId() === id);
}
buscarUsuarioPorId(id:string): Usuario | undefined {
    return this.usuarios.find(u => u.getId() === id);
}
//PRÉSTAMO
realizarPrestamo(usuarioId: string, libroId: string):void{
    const usuario = this.buscarUsuarioPorId(usuarioId);
    const libro = this.buscarLibroPorId(libroId);

    if (!usuario) throw new Error("Usuario no encontrado");
    if (!libro) throw new Error("Libro no encontrado");

    if (!usuario.puedeSolicitarPrestamo()) {
      throw new Error("Usuario alcanzó el límite de préstamos");
    }

    if (!libro.esPrestable()) {
      throw new Error("Libro no disponible para préstamo");
    }

    const ejemplarDisponible = libro.obtenerEjemplarDisponible();
    if (!ejemplarDisponible) {
      throw new Error("No hay ejemplares disponibles");
    }

    const nuevoPrestamo = new Prestamo(usuario, ejemplarDisponible);
    this.prestamos.push(nuevoPrestamo);

    usuario.agregarPrestamo(nuevoPrestamo);
}
//DEVOLUCION
registrarDevolucion(prestamoId: string): void {

    const prestamo = this.prestamos.find(p => p.getId() === prestamoId);

    if (!prestamo) throw new Error("Préstamo no encontrado");

    prestamo.devolver();
  }

  // REPORTES
  
  listarPrestamosActivos(): Prestamo[] {
    return this.prestamos.filter(p => 
      p.getEstado() === EstadoPrestamo.ACTIVO
    );
  }

  listarPrestamosVencidos(): Prestamo[] {
    return this.prestamos.filter(p => {p.verificarVenci();
      return p.getEstado() === EstadoPrestamo.VENCIDO;
    });

  }

}

