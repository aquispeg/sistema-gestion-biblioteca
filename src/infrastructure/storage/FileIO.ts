import fs from "fs";

export class FileIO {
  // Escribir texto en un archivo 
  static async escribirTexto(path: string, contenido: string): Promise<void> {
    await fs.promises.writeFile(path, contenido, { encoding: "utf-8" });
  }

  // Leer texto de un archivo 
  static async leerTexto(path: string): Promise<string> {
    return await fs.promises.readFile(path, { encoding: "utf-8" });
  }
}