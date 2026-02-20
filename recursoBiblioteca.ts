export abstract class RecursoBiblioteca{
    id:string;
    titulo:string;
    categoria: categoriaLibro;
    fechaRegistro: Date;
    constructor(id:string,titulo:string, categoria: categoriaLibro){
        this.id=id;
        this.titulo=titulo;
        this.categoria=categoria;
        this.fechaRegistro= new Date();
    }
}