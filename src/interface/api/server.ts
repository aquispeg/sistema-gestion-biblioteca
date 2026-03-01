import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

// ── Importar TUS clases reales ──
import { BibliotecaService } from "../../application/bibliotecaService";
import { Categoria }         from "../../domain/categoLibro";
import { Libro }             from "../../domain/libro";
import { Ejemplar }          from "../../domain/ejemplar";
import { Estudiante, Docente } from "../../domain/Usuario";
import { CategoriaLibro }    from "../../domain/enums/index";

// ══════════════════════════════════════════
// INSTANCIA ÚNICA del servicio (en memoria)
// ══════════════════════════════════════════
const sistema = new BibliotecaService();

// Datos de ejemplo precargados
const catFiccion    = new Categoria("Ficción",    CategoriaLibro.FICCION,    7,  true);
const catCiencia    = new Categoria("Ciencia",    CategoriaLibro.CIENCIA,    7,  true);
const catLiteratura = new Categoria("Literatura", CategoriaLibro.LITERATURA, 14, true);
const catReferencia = new Categoria("Referencia", CategoriaLibro.HISTORIA,   0,  false);

const categoriaMap: Record<string, Categoria> = {
  FICCION:     catFiccion,
  CIENCIA:     catCiencia,
  LITERATURA:  catLiteratura,
  HISTORIA:    catReferencia,
  MATEMATICAS: new Categoria("Matemáticas", CategoriaLibro.MATEMATICAS, 7, true),
  REVISTA:     new Categoria("Revista",     CategoriaLibro.REVISTA,     3, true),
};

const libro1 = new Libro("L1", "El Principito",             catFiccion,    "Antoine de Saint-Exupéry");
libro1.agregarEjemplar(new Ejemplar("E1"));
libro1.agregarEjemplar(new Ejemplar("E2"));

const libro2 = new Libro("L2", "Breve Historia del Tiempo", catCiencia,    "Stephen Hawking");
libro2.agregarEjemplar(new Ejemplar("E3"));

const libro3 = new Libro("L3", "Cien Años de Soledad",      catLiteratura, "Gabriel García Márquez");
libro3.agregarEjemplar(new Ejemplar("E4"));
libro3.agregarEjemplar(new Ejemplar("E5"));

const libro4 = new Libro("L4", "Enciclopedia Universal",    catReferencia, "Varios");
libro4.agregarEjemplar(new Ejemplar("E6"));

sistema.registrarLibro(libro1);
sistema.registrarLibro(libro2);
sistema.registrarLibro(libro3);
sistema.registrarLibro(libro4);

sistema.registrarUsuario(new Estudiante("U1", "Ana García",     "PRIMARIA"));
sistema.registrarUsuario(new Estudiante("U2", "Luis Torres",    "SECUNDARIA"));
sistema.registrarUsuario(new Docente   ("U3", "Carlos Mendoza"));

// ══════════════════════════════════════════
// SERVIDOR EXPRESS
// ══════════════════════════════════════════
const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(process.cwd(), "public")));

// ──────────────────────────────────────────
// HELPER: serializar Libro para el frontend
// ──────────────────────────────────────────
function serializarLibro(libro: Libro) {
  const ejemplarDisp = libro.obtenerEjemplarDisponible();
  return {
    id:           libro.getId(),
    titulo:       libro.getTitulo(),
    autor:        libro.getAutor(),
    categoria:    libro.getCategoria().getNombre(),
    categoriaEnum:libro.getCategoria().categoria,
    dias:         libro.getDiasMaxPrestamo(),
    prestable:    libro.getCategoria().esPrestable(),
    disponible:   ejemplarDisp !== undefined,
    esPrestable:  libro.esPrestable(),
  };
}

function serializarUsuario(u: any) {
  return {
    id:     u.getId(),
    nombre: u.getNombre(),
    tipo:   u.getTipoUsuario(),
    max:    u.getMaxPrestamos(),
  };
}

function serializarPrestamo(p: any) {
  return {
    id:          p.getId(),
    usuario:     p.getUsuario().getNombre(),
    usuarioId:   p.getUsuario().getId(),
    libro:       p.getLibro().getTitulo(),
    libroId:     p.getLibro().getId(),
    inicio:      p.getFechaInicio(),
    vencimiento: p.getFechaVencimiento(),
    estado:      p.getEstado(),
    diasRestantes: p.getDiasRestantes(),
    diasRetraso:   p.getDiasRetraso(),
  };
}

function serializarMulta(m: any) {
  return {
    id:          m.getId(),
    prestamoId:  m.getPrestamoId(),
    usuario:     m.toString().split("Usuario: ")[1]?.split(" |")[0] ?? "",
    monto:       m.getMonto(),
    diasRetraso: m.getDiasRetraso(),
    pagada:      m.isPagada(),
  };
}

// ══════════════════════════════════════════
// RUTAS API
// ══════════════════════════════════════════

// ── LIBROS ──
app.get("/api/libros", (_req: Request, res: Response) => {
  const libros = (sistema as any).libros.map(serializarLibro);
  res.json(libros);
});

app.post("/api/libros", (req: Request, res: Response) => {
  try {
    const { id, titulo, autor, categoriaEnum, dias, prestable, ejemplares } = req.body;

    if (!id || !titulo || !autor || !categoriaEnum) {
      res.status(400).json({ error: "Faltan datos obligatorios" });
      return;
    }

    if (sistema.buscarLibro(id)) {
      res.status(400).json({ error: `Ya existe un libro con ID ${id}` });
      return;
    }

    const cat = categoriaMap[categoriaEnum];
    if (!cat) {
      res.status(400).json({ error: "Categoría inválida" });
      return;
    }

    // Crear nueva categoría con los parámetros recibidos
    const catPersonalizada = new Categoria(
      cat.getNombre(),
      cat.categoria,
      dias ?? cat.getDiasMaxPrestamo(),
      prestable ?? true
    );

    const libro = new Libro(id, titulo, catPersonalizada, autor);
    const codigos: string[] = ejemplares ?? [];
    codigos.forEach((cod: string) => libro.agregarEjemplar(new Ejemplar(cod)));

    sistema.registrarLibro(libro);
    res.status(201).json({ mensaje: `Libro "${titulo}" registrado`, libro: serializarLibro(libro) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── USUARIOS ──
app.get("/api/usuarios", (_req: Request, res: Response) => {
  const usuarios = (sistema as any).usuarios.map(serializarUsuario);
  res.json(usuarios);
});

app.post("/api/usuarios", (req: Request, res: Response) => {
  try {
    const { id, nombre, tipo } = req.body;
    if (!id || !nombre || !tipo) {
      res.status(400).json({ error: "Faltan datos obligatorios" });
      return;
    }
    if (sistema.buscarUsuario(id)) {
      res.status(400).json({ error: `Ya existe un usuario con ID ${id}` });
      return;
    }

    let usuario;
    if (tipo === "PRIMARIA")   usuario = new Estudiante(id, nombre, "PRIMARIA");
    else if (tipo === "SECUNDARIA") usuario = new Estudiante(id, nombre, "SECUNDARIA");
    else if (tipo === "DOCENTE")    usuario = new Docente(id, nombre);
    else { res.status(400).json({ error: "Tipo inválido" }); return; }

    sistema.registrarUsuario(usuario);
    res.status(201).json({ mensaje: `Usuario "${nombre}" registrado` });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── PRÉSTAMOS ──
app.get("/api/prestamos", (_req: Request, res: Response) => {
  sistema.verificarVencimientos();
  const prestamos = sistema.listarPrestamos().map(serializarPrestamo);
  res.json(prestamos);
});

app.post("/api/prestamos", (req: Request, res: Response) => {
  try {
    const { usuarioId, libroId } = req.body;
    const prestamo = sistema.realizarPrestamo(usuarioId, libroId);
    res.status(201).json({ mensaje: "Préstamo creado", prestamo: serializarPrestamo(prestamo) });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── DEVOLUCIÓN ──
app.post("/api/devoluciones", (req: Request, res: Response) => {
  try {
    const { prestamoId } = req.body;
    const multa = sistema.devolverLibro(prestamoId);
    res.json({
      mensaje: "Devolución registrada",
      multa: multa ? serializarMulta(multa) : null,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── MULTAS ──
app.get("/api/multas", (_req: Request, res: Response) => {
  const multas = sistema.listarMultas().map(serializarMulta);
  res.json(multas);
});

app.post("/api/multas/:id/pagar", (req: Request, res: Response) => {
  try {
    sistema.pagarMulta(String(req.params.id));
    res.json({ mensaje: "Multa pagada" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── ALERTAS ──
app.get("/api/alertas", (_req: Request, res: Response) => {
  const proximos = sistema.getAlertasVencimiento(3).map(serializarPrestamo);
  const vencidos = sistema.getPrestamosvencidos().map(serializarPrestamo);
  res.json({ proximos, vencidos });
});

// ── HISTORIAL ──
app.get("/api/historial", (_req: Request, res: Response) => {
  const historial = sistema.listarHistorial().map((h: any) => ({
    id:        h.getId(),
    usuarioId: h.getUsuarioId(),
    libroId:   h.getLibro(),
    conMulta:  h.getMultaGenerada(),
    detalle:   h.toString(),
  }));
  res.json(historial);
});

// ── INICIAR SERVIDOR ──
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Abre el navegador en http://localhost:${PORT}\n`);
});