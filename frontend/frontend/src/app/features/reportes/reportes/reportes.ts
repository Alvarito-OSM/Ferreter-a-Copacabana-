
import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';

interface Venta {
  idVenta: number;
  idCliente: number;
  idEmpleado: number;
  fecha: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  estado: string;
}

interface Compra {
  idCompra: number;
  idProveedor: number;
  idAdministrador: number;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
}

interface MovimientoDia {
  fecha: string;
  etiqueta: string;
  ventas: number;
  compras: number;
  cantidadVentas: number;
  cantidadCompras: number;
}

type TipoCalendario = 'inicio' | 'fin';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://localhost:8080/api';

  descargando = false;
  cargando = false;
  mensaje = '';
  errorDatos = '';

  ventas: Venta[] = [];
  compras: Compra[] = [];
  movimientos: MovimientoDia[] = [];

  fechaInicio = '';
  fechaFin = '';

  calendarioAbierto: TipoCalendario | null = null;
  mesVisible = 0;
  anioVisible = 0;

  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre',
    'Diciembre'
  ];

  celdasCalendario: (number | null)[] = [];

  constructor() {
    const hoy = new Date();

    this.fechaInicio = this.formatearFecha(
      new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    );

    this.fechaFin = this.formatearFecha(hoy);

    this.mesVisible = hoy.getMonth();
    this.anioVisible = hoy.getFullYear();

    this.generarCalendario();
  }

  ngOnInit(): void {
    void this.cargarDatos();
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private fechaDeRegistro(valor: string): string {
    if (!valor) return '';

    // Admite fechas ISO de Java/Spring Boot.
    const coincidencia = String(valor).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    return coincidencia ? coincidencia[0] : '';
  }

  private fechaLocal(valor: string): Date {
    const [anio, mes, dia] = valor.split('-').map(Number);

    return new Date(anio, mes - 1, dia);
  }

  get fechaInicioTexto(): string {
    return this.fechaLegible(this.fechaInicio);
  }

  get fechaFinTexto(): string {
    return this.fechaLegible(this.fechaFin);
  }

  private fechaLegible(valor: string): string {
    const fecha = this.fechaLocal(valor);

    return `${fecha.getDate()} de ${
      this.nombresMeses[fecha.getMonth()]
    } de ${fecha.getFullYear()}`;
  }

  // =====================================
  // CALENDARIO DESPLEGABLE
  // =====================================

  abrirCalendario(tipo: TipoCalendario): void {
    if (this.calendarioAbierto === tipo) {
      this.calendarioAbierto = null;
      return;
    }

    this.calendarioAbierto = tipo;

    const fecha = this.fechaLocal(
      tipo === 'inicio' ? this.fechaInicio : this.fechaFin
    );

    this.mesVisible = fecha.getMonth();
    this.anioVisible = fecha.getFullYear();

    this.generarCalendario();
  }

  cerrarCalendario(): void {
    this.calendarioAbierto = null;
  }

  cambiarMes(direccion: number): void {
    const fecha = new Date(
      this.anioVisible,
      this.mesVisible + direccion,
      1
    );

    this.mesVisible = fecha.getMonth();
    this.anioVisible = fecha.getFullYear();

    this.generarCalendario();
  }

  generarCalendario(): void {
    const primerDia = new Date(
      this.anioVisible,
      this.mesVisible,
      1
    );

    const cantidadDias = new Date(
      this.anioVisible,
      this.mesVisible + 1,
      0
    ).getDate();

    const desplazamiento = (primerDia.getDay() + 6) % 7;

    const celdas: (number | null)[] = [];

    for (let i = 0; i < desplazamiento; i++) {
      celdas.push(null);
    }

    for (let dia = 1; dia <= cantidadDias; dia++) {
      celdas.push(dia);
    }

    while (celdas.length % 7 !== 0) {
      celdas.push(null);
    }

    this.celdasCalendario = celdas;
  }

  seleccionarDia(dia: number | null): void {
    if (dia === null || !this.calendarioAbierto) return;

    const fecha = this.formatearFecha(
      new Date(this.anioVisible, this.mesVisible, dia)
    );

    if (this.calendarioAbierto === 'inicio') {
      this.fechaInicio = fecha;

      if (this.fechaInicio > this.fechaFin) {
        this.fechaFin = fecha;
      }
    } else {
      this.fechaFin = fecha;

      if (this.fechaFin < this.fechaInicio) {
        this.fechaInicio = fecha;
      }
    }

    this.calendarioAbierto = null;
    this.actualizarGraficas();
  }

  esDiaSeleccionado(dia: number | null): boolean {
    if (dia === null || !this.calendarioAbierto) return false;

    const fecha = this.formatearFecha(
      new Date(this.anioVisible, this.mesVisible, dia)
    );

    const seleccionada = this.calendarioAbierto === 'inicio'
      ? this.fechaInicio
      : this.fechaFin;

    return fecha === seleccionada;
  }

  esHoy(dia: number | null): boolean {
    if (dia === null) return false;

    return this.formatearFecha(
      new Date(this.anioVisible, this.mesVisible, dia)
    ) === this.formatearFecha(new Date());
  }

  // =====================================
  // FILTROS RÁPIDOS
  // =====================================

  seleccionarPeriodo(
    periodo: 'hoy' | 'semana' | 'mes'
  ): void {
    const hoy = new Date();

    if (periodo === 'hoy') {
      this.fechaInicio = this.formatearFecha(hoy);
    }

    if (periodo === 'semana') {
      const inicio = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate() - 6
      );

      this.fechaInicio = this.formatearFecha(inicio);
    }

    if (periodo === 'mes') {
      this.fechaInicio = this.formatearFecha(
        new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      );
    }

    this.fechaFin = this.formatearFecha(hoy);
    this.calendarioAbierto = null;

    this.actualizarGraficas();
  }

  // =====================================
  // CARGAR DATOS REALES
  // =====================================

  async cargarDatos(): Promise<void> {
    if (this.cargando) return;

    this.cargando = true;
    this.errorDatos = '';

    try {
      const [ventas, compras] = await Promise.all([
        firstValueFrom(
          this.http.get<Venta[]>(`${this.apiUrl}/ventas`)
        ),
        firstValueFrom(
          this.http.get<Compra[]>(`${this.apiUrl}/compras`)
        )
      ]);

      this.ventas = ventas;
      this.compras = compras;

      this.actualizarGraficas();

    } catch (error) {
      console.error('Error al cargar reportes:', error);

      this.ventas = [];
      this.compras = [];
      this.movimientos = [];

      this.errorDatos =
        'No se pudieron cargar los datos. Verifica el backend y tu sesión.';

    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  // =====================================
  // AGRUPAR VENTAS Y COMPRAS POR DÍA
  // =====================================

  actualizarGraficas(): void {
    if (!this.fechaInicio || !this.fechaFin) return;

    const inicio = this.fechaLocal(this.fechaInicio);
    const fin = this.fechaLocal(this.fechaFin);

    if (inicio > fin) {
      this.movimientos = [];
      return;
    }

    const cantidadDias = Math.round(
      (Date.UTC(
        fin.getFullYear(),
        fin.getMonth(),
        fin.getDate()
      ) - Date.UTC(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate()
      )) / 86400000
    ) + 1;

    // Evita dibujar cientos de barras a la vez.
    if (cantidadDias > 62) {
      this.movimientos = [];
      return;
    }

    const mapa = new Map<string, MovimientoDia>();

    for (
      let fecha = new Date(inicio);
      fecha <= fin;
      fecha.setDate(fecha.getDate() + 1)
    ) {
      const clave = this.formatearFecha(fecha);

      mapa.set(clave, {
        fecha: clave,
        etiqueta: `${fecha.getDate()}/${
          fecha.getMonth() + 1
        }`,
        ventas: 0,
        compras: 0,
        cantidadVentas: 0,
        cantidadCompras: 0
      });
    }

    for (const venta of this.ventas) {
      const clave = this.fechaDeRegistro(venta.fecha);
      const dia = mapa.get(clave);

      if (dia) {
        dia.ventas += Number(venta.total) || 0;
        dia.cantidadVentas++;
      }
    }

    for (const compra of this.compras) {
      const clave = this.fechaDeRegistro(compra.fecha);
      const dia = mapa.get(clave);

      if (dia) {
        dia.compras += Number(compra.total) || 0;
        dia.cantidadCompras++;
      }
    }

    this.movimientos = Array.from(mapa.values());
  }

  get rangoDemasiadoGrande(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return false;

    const inicio = this.fechaLocal(this.fechaInicio);
    const fin = this.fechaLocal(this.fechaFin);

    const dias = (
      Date.UTC(fin.getFullYear(), fin.getMonth(), fin.getDate()) -
      Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
    ) / 86400000 + 1;

    return dias > 62;
  }

  get totalVentas(): number {
    return this.movimientos.reduce(
      (total, dia) => total + dia.ventas, 0
    );
  }

  get totalCompras(): number {
    return this.movimientos.reduce(
      (total, dia) => total + dia.compras, 0
    );
  }

  get cantidadVentas(): number {
    return this.movimientos.reduce(
      (total, dia) => total + dia.cantidadVentas, 0
    );
  }

  get cantidadCompras(): number {
    return this.movimientos.reduce(
      (total, dia) => total + dia.cantidadCompras, 0
    );
  }

  get balanceMovimientos(): number {
    return this.totalVentas - this.totalCompras;
  }

  get diaMayorVenta(): MovimientoDia | null {
    const dias = this.movimientos.filter(d => d.ventas > 0);

    if (!dias.length) return null;

    return dias.reduce(
      (mayor, actual) =>
        actual.ventas > mayor.ventas ? actual : mayor
    );
  }

  get diaMayorCompra(): MovimientoDia | null {
    const dias = this.movimientos.filter(d => d.compras > 0);

    if (!dias.length) return null;

    return dias.reduce(
      (mayor, actual) =>
        actual.compras > mayor.compras ? actual : mayor
    );
  }

  get maximoGrafica(): number {
    return Math.max(
      1,
      ...this.movimientos.map(
        dia => Math.max(dia.ventas, dia.compras)
      )
    );
  }

  alturaBarra(valor: number): number {
    if (valor <= 0) return 0;

    return (valor / this.maximoGrafica) * 100;
  }

  get hayMovimientos(): boolean {
    return this.cantidadVentas > 0 ||
           this.cantidadCompras > 0;
  }

  // =====================================
  // EXPORTACIONES EXCEL EXISTENTES
  // =====================================

  async descargarVentas(): Promise<void> {
    await this.exportar<Venta>(
      'ventas',
      'Reporte de Ventas',
      [
        'ID Venta', 'ID Cliente', 'ID Empleado',
        'Fecha', 'Subtotal', 'IVA',
        'Descuento', 'Total', 'Estado'
      ],
      (ventas: Venta[]) => ventas.map(v => [
        v.idVenta,
        v.idCliente,
        v.idEmpleado,
        v.fecha,
        Number(v.subtotal),
        Number(v.iva),
        Number(v.descuento),
        Number(v.total),
        v.estado
      ])
    );
  }

  async descargarCompras(): Promise<void> {
    await this.exportar<Compra>(
      'compras',
      'Reporte de Compras',
      [
        'ID Compra', 'ID Proveedor', 'ID Administrador',
        'Fecha', 'Subtotal', 'IVA', 'Total', 'Estado'
      ],
      (compras: Compra[]) => compras.map(c => [
        c.idCompra,
        c.idProveedor,
        c.idAdministrador,
        c.fecha,
        Number(c.subtotal),
        Number(c.iva),
        Number(c.total),
        c.estado
      ])
    );
  }

  private async exportar<T>(
    endpoint: string,
    titulo: string,
    columnas: string[],
    transformar: (registros: T[]) => ExcelJS.CellValue[][]
  ): Promise<void> {

    if (this.descargando) return;

    this.descargando = true;
    this.mensaje = '';

    try {
      const registros = await firstValueFrom(
        this.http.get<T[]>(`${this.apiUrl}/${endpoint}`)
      );

      const workbook = new ExcelJS.Workbook();
      const hoja = workbook.addWorksheet(titulo);

      hoja.addRow([titulo]);
      hoja.addRow(['Ferretería Copacabana']);
      hoja.addRow([]);

      const encabezado = hoja.addRow(columnas);

      encabezado.eachCell(celda => {
        celda.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };

        celda.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF991B1B' }
        };
      });

      transformar(registros).forEach(fila => {
        hoja.addRow(fila);
      });

      hoja.columns.forEach(columna => {
        columna.width = 22;
      });

      hoja.getRow(1).font = {
        bold: true,
        size: 18,
        color: { argb: 'FF991B1B' }
      };

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob(
        [buffer as BlobPart],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      );

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');

      enlace.href = url;
      enlace.download = `reporte_${endpoint}.xlsx`;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      this.mensaje = 'Reporte descargado correctamente.';

    } catch (error) {
      console.error('Error al exportar:', error);
      this.mensaje =
        'Error al descargar. Verifica el backend.';

    } finally {
      this.descargando = false;
      this.cdr.detectChanges();
    }
  }
}
