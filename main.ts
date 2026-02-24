//Simulacion del sistema
import {BibliotecaService} from "./bibliotecaService";
import {Categoria} from "./categoLibro";
import {Libro} from "./libro";
import {Ejemplar} from "./ejemplar";
import {Usuario} from "./Usuario";
import {Prestamo} from "./prestamo";

//INICIALIZAR SISTEMA

const biblioteca= new BibliotecaService();
console.log("=====INICIANDO SISTEMA DE BIBLIOTECA =====");

//CREAR CATEGORÍAS
const categoriaGeneral =new Categoria("General",5, true);
//CREAR LIBRO 
const libro1= new Libro("L1","El Principito",categoriaGeneral, "Antoine de Saint-Exupéry" );