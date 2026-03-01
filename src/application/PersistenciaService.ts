import { JsonFileDb } from "../infrastructure/storage/JsonFileDb";
import { LogFile } from "../infrastructure/storage/LogFile";
import { LibroDTO, UsuarioDTO, PrestamoDTO, MultaDTO } from "../infrastructure/storage/DTOs";

// ================================================
// Servicio que centraliza toda la persistencia
// del sistema de biblioteca en archivos JSON + log
// ================================================

export class PersistenciaService {
  private dbLibros    = new JsonFileDb<LibroDTO>   ("data/libros.json");
  private dbUsuarios  = new JsonFileDb<UsuarioDTO> ("data/usuarios.json");
  private dbPrestamos = new JsonFileDb<PrestamoDTO>("data/prestamos.json");
  private dbMultas    = new JsonFileDb<MultaDTO>   ("data/multas.json");
  private log         = new LogFile("data/auditoria.log");

  // ──────────────────────────────────────────────
  // LIBROS
  // ──────────────────────────────────────────────

  async guardarLibros(libros: LibroDTO[]): Promise<void> {
    await this.dbLibros.guardarTodo(libros);
    await this.log.append(`LIBROS guardados (${libros.length} registros)`);
  }

  async cargarLibros(): Promise<LibroDTO[]> {
    const lista = await this.dbLibros.leerTodo();
    await this.log.append(`LIBROS cargados (${lista.length} registros)`);
    return lista;
  }

  async agregarLibro(libro: LibroDTO): Promise<void> {
    const lista = await this.dbLibros.leerTodo();
    if (lista.some(l => l.id === libro.id)) {
      throw new Error(`Ya existe un libro con ID ${libro.id}`);
    }
    lista.push(libro);
    await this.dbLibros.guardarTodo(lista);
    await this.log.append(`LIBRO registrado: [${libro.id}] "${libro.titulo}" - ${libro.autor}`);
  }

  // ──────────────────────────────────────────────
  // USUARIOS
  // ──────────────────────────────────────────────

  async guardarUsuarios(usuarios: UsuarioDTO[]): Promise<void> {
    await this.dbUsuarios.guardarTodo(usuarios);
    await this.log.append(`USUARIOS guardados (${usuarios.length} registros)`);
  }

  async cargarUsuarios(): Promise<UsuarioDTO[]> {
    const lista = await this.dbUsuarios.leerTodo();
    await this.log.append(`USUARIOS cargados (${lista.length} registros)`);
    return lista;
  }

  async agregarUsuario(usuario: UsuarioDTO): Promise<void> {
    const lista = await this.dbUsuarios.leerTodo();
    if (lista.some(u => u.id === usuario.id)) {
      throw new Error(`Ya existe un usuario con ID ${usuario.id}`);
    }
    lista.push(usuario);
    await this.dbUsuarios.guardarTodo(lista);
    await this.log.append(`USUARIO registrado: [${usuario.id}] ${usuario.nombre} (${usuario.tipo})`);
  }

  // ──────────────────────────────────────────────
  // PRÉSTAMOS
  // ──────────────────────────────────────────────

  async guardarPrestamos(prestamos: PrestamoDTO[]): Promise<void> {
    await this.dbPrestamos.guardarTodo(prestamos);
    await this.log.append(`PRÉSTAMOS guardados (${prestamos.length} registros)`);
  }

  async cargarPrestamos(): Promise<PrestamoDTO[]> {
    return await this.dbPrestamos.leerTodo();
  }

  async agregarPrestamo(prestamo: PrestamoDTO): Promise<void> {
    const lista = await this.dbPrestamos.leerTodo();
    lista.push(prestamo);
    await this.dbPrestamos.guardarTodo(lista);
    await this.log.append(`PRÉSTAMO creado: [${prestamo.id}] ${prestamo.usuarioNombre} → "${prestamo.tituloLibro}"`);
  }

  async actualizarEstadoPrestamo(id: string, estado: string): Promise<void> {
    const lista = await this.dbPrestamos.leerTodo();
    const prestamo = lista.find(p => p.id === id);
    if (!prestamo) throw new Error(`Préstamo ${id} no encontrado`);
    prestamo.estado = estado;
    await this.dbPrestamos.guardarTodo(lista);
    await this.log.append(`PRÉSTAMO actualizado: [${id}] → Estado: ${estado}`);
  }

  // ──────────────────────────────────────────────
  // MULTAS
  // ──────────────────────────────────────────────

  async guardarMultas(multas: MultaDTO[]): Promise<void> {
    await this.dbMultas.guardarTodo(multas);
  }

  async cargarMultas(): Promise<MultaDTO[]> {
    return await this.dbMultas.leerTodo();
  }

  async agregarMulta(multa: MultaDTO): Promise<void> {
    const lista = await this.dbMultas.leerTodo();
    lista.push(multa);
    await this.dbMultas.guardarTodo(lista);
    await this.log.append(`MULTA generada: [${multa.id}] ${multa.usuarioNombre} | S/ ${multa.monto.toFixed(2)} | ${multa.diasRetraso} día(s) retraso`);
  }

  async pagarMulta(multaId: string): Promise<void> {
    const lista = await this.dbMultas.leerTodo();
    const multa = lista.find(m => m.id === multaId);
    if (!multa) throw new Error(`Multa ${multaId} no encontrada`);
    multa.pagada = true;
    await this.dbMultas.guardarTodo(lista);
    await this.log.append(`MULTA pagada: [${multaId}]`);
  }

  // ──────────────────────────────────────────────
  // LOG
  // ──────────────────────────────────────────────

  async verLog(): Promise<string> {
    return await this.log.leerTodo();
  }

  async registrarLog(mensaje: string): Promise<void> {
    await this.log.append(mensaje);
  }
}