import fs from "fs";

export class JsonFileDb<T> {
  constructor(private path: string) {}

  // Crea el archivo si no existe
  private async asegurarArchivo(): Promise<void> {
    try {
      await fs.promises.access(this.path);
    } catch {
      await fs.promises.writeFile(this.path, JSON.stringify([]), { encoding: "utf-8" });
    }
  }

  // Leer todos los registros
  async leerTodo(): Promise<T[]> {
    await this.asegurarArchivo();
    const contenido = await fs.promises.readFile(this.path, { encoding: "utf-8" });
    try {
      return JSON.parse(contenido) as T[];
    } catch {
      // Si el JSON está corrupto, reinicia a []
      await fs.promises.writeFile(this.path, JSON.stringify([]), { encoding: "utf-8" });
      return [];
    }
  }

  // Guardar todos los registros (reemplaza)
  async guardarTodo(data: T[]): Promise<void> {
    await this.asegurarArchivo();
    await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2), { encoding: "utf-8" });
  }
}