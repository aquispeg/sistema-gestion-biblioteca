export class Multa{
    private static contador=1;
    private id: string;
    private pagada:boolean=false;
    private monto: number;
    private diasRetraso:number;
    private fechaGeneracion:Date;
    static readonly MONTO_POR_DIA=1.00;

    constructor(private prestamoId:string, private usuarioNombre:string, private tituloLibro:string, diasRetraso:number){
        this.id=`MUL-$-{Multa.contador++}`;
        this.diasRetraso=diasRetraso;
        this.monto=diasRetraso*Multa.MONTO_POR_DIA;
        this.fechaGeneracion=new Date();
    }
    getId():string {
        return this.id;
    }
    getPrestamoId():string {
        return this.prestamoId;
    }
    getMonto():number{
        return this.monto;
    }
    getDiasRetraso():number{
        return this.diasRetraso;
    }
    isPagada():boolean{
        return this.pagada;
    }
    pagar(): void{
        if(this.pagada) throw new Error("L multa ya fue pagada");
        this.pagada=true;
    }
    toString():string{
        const estado=this.pagada? "PAGADA":"PENDIENTE";
        return (
           `[${this.id}] Usuario: ${this.usuarioNombre} | ` +
            `Libro: "${this.tituloLibro}" | ` +
            `Retraso: ${this.diasRetraso} día(s) | ` +
            `Monto: S/ ${this.monto.toFixed(2)} | ` +
            `Estado: ${estado}` 
        );
    }
}