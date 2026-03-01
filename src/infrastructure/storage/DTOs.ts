export interface LibroDTO {
  id: string;
  titulo: string;
  autor: string;
  categoriaEnum: string;
  categoriaNombre: string;
  diasMaxPrestamo: number;
  prestable: boolean;
  ejemplares: EjemplarDTO[];
}

export interface EjemplarDTO {
  codigo: string;
  estado: string;
}

export interface UsuarioDTO {
  id: string;
  nombre: string;
  tipo: string; // PRIMARIA | SECUNDARIA | DOCENTE
}

export interface PrestamoDTO {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  libroId: string;
  tituloLibro: string;
  ejemplarCodigo: string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
}

export interface MultaDTO {
  id: string;
  prestamoId: string;
  usuarioNombre: string;
  tituloLibro: string;
  diasRetraso: number;
  monto: number;
  pagada: boolean;
}