import fs from "fs";

export class StreamReader {
  // Lee un archivo por chunks y retorna el total de bytes leídos
  static leerPorChunks(path: string): Promise<number> {
    console.log("  Iniciando lectura por STREAM (chunks de 64KB)...");
    return new Promise((resolve, reject) => {
      let total = 0;
      const stream = fs.createReadStream(path, { highWaterMark: 64 * 1024 });

      stream.on("data", (chunk) => {
        total += (chunk as Buffer).length;
        console.log(`  Chunk recibido: ${(chunk as Buffer).length} bytes`);
      });

      stream.on("end", () => {
        console.log(`  FIN STREAM — Total leído: ${total} bytes`);
        resolve(total);
      });

      stream.on("error", (err) => reject(err));
    });
  }

  // Leer solo los primeros N bytes
  static leerParcial(path: string, bytes: number): Promise<string> {
    return new Promise((resolve, reject) => {
      let contenido = "";
      const stream = fs.createReadStream(path, { start: 0, end: bytes - 1, encoding: "utf-8" });

      stream.on("data", (chunk) => { contenido += chunk; });
      stream.on("end", () => resolve(contenido));
      stream.on("error", (err) => reject(err));
    });
  }
}