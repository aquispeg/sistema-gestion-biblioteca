import fs from "fs";

export class LogFile {
  constructor(private path: string) {}

  // Agrega una línea al log sin borrar el contenido anterior
  async append(linea: string): Promise<void> {
    const registro = `${new Date().toISOString()} | ${linea}\n`;
    await fs.promises.appendFile(this.path, registro, { encoding: "utf-8" });
  }

  // Leer todo el log
  async leerTodo(): Promise<string> {
    try {
      return await fs.promises.readFile(this.path, { encoding: "utf-8" });
    } catch {
      return "(log vacío)";
    }
  }
}