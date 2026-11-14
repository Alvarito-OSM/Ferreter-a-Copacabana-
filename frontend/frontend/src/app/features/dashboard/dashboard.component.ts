import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';

Chart.register(...registerables);

interface TopProducto {
  nombre: string;
  ventas: number;
  imagen: string | null;
}

interface Alerta {
  tipo: string;
  mensaje: string;
  clase: string;
}

interface Actividad {
  icono: string;
  color: string;
  mensaje: string;
  tiempo: string;
  fecha: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly api = 'http://localhost:8080/api';
  private readonly dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  isDarkMode: boolean = false;
  fechaActual: Date = new Date();
  cargando: boolean = true;

  ventasHoy: number = 0;
  cantidadVentasHoy: number = 0;
  productosStock: number = 0;
  totalInventario: number = 0;
  productosStockBajo: number = 0;
  productosSinStock: number = 0;
  comprasMes: number = 0;
  cantidadComprasMes: number = 0;

  porcentajeStock: number = 0;
  porcentajeBajo: number = 0;
  porcentajeSin: number = 0;

  topProductos: TopProducto[] = [];
  maxVentasTop: number = 1;
  alertas: Alerta[] = [];
  actividades: Actividad[] = [];

  private etiquetasSemana: string[] = [];
  private ventasSemana: number[] = [];

  @ViewChild('ventasChart') ventasChart!: ElementRef;
  @ViewChild('stockChart') stockChart!: ElementRef;

  private chartVentasInstance: Chart | null = null;
  private chartStockInstance: Chart | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkDarkMode();
    this.cargarDatosServidor();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.chartVentasInstance) this.chartVentasInstance.destroy();
    if (this.chartStockInstance) this.chartStockInstance.destroy();
  }

  checkDarkMode(): void {
    this.isDarkMode = document.body.classList.contains('dark-mode');
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  cargarDatosServidor(): void {
    forkJoin({
      ventas: this.http.get<any[]>(`${this.api}/ventas`).pipe(catchError(() => of([] as any[]))),
      detalles: this.http.get<any[]>(`${this.api}/ventas/detalles`).pipe(catchError(() => of([] as any[]))),
      compras: this.http.get<any[]>(`${this.api}/compras`).pipe(catchError(() => of([] as any[]))),
      inventario: this.http.get<any[]>(`${this.api}/inventario`).pipe(catchError(() => of([] as any[]))),
      productos: this.http.get<any[]>(`${this.api}/productos`).pipe(catchError(() => of([] as any[])))
    }).subscribe(datos => {
      this.procesarDatos(datos.ventas, datos.detalles, datos.compras, datos.inventario, datos.productos);
      this.cargando = false;
      this.cdRef.detectChanges();
      this.crearGraficos();
    });
  }

  private procesarDatos(ventas: any[], detalles: any[], compras: any[], inventario: any[], productos: any[]): void {
    const ventasValidas = ventas.filter(v => v.estado !== 'ANULADA');
    const comprasValidas = compras.filter(c => c.estado !== 'ANULADA');
    const hoy = new Date();

    const ventasDeHoy = ventasValidas.filter(v => this.mismoDia(new Date(v.fecha), hoy));
    this.ventasHoy = this.sumar(ventasDeHoy);
    this.cantidadVentasHoy = ventasDeHoy.length;

    const comprasDelMes = comprasValidas.filter(c => {
      const f = new Date(c.fecha);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    });
    this.comprasMes = this.sumar(comprasDelMes);
    this.cantidadComprasMes = comprasDelMes.length;

    this.calcularInventario(inventario);
    this.calcularSemana(ventasValidas, hoy);
    this.calcularTopProductos(ventasValidas, detalles, productos);
    this.calcularAlertas(inventario);
    this.calcularActividades(ventasValidas, comprasValidas);
  }

  private sumar(lista: any[]): number {
    return lista.reduce((acc, item) => acc + Number(item.total || 0), 0);
  }

  private mismoDia(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private calcularInventario(inventario: any[]): void {
    const sinStock = inventario.filter(i => i.stockActual <= 0);
    const bajo = inventario.filter(i => i.stockActual > 0 && i.stockActual <= i.stockMinimo);
    const normal = inventario.filter(i => i.stockActual > i.stockMinimo);

    this.totalInventario = inventario.length;
    this.productosSinStock = sinStock.length;
    this.productosStockBajo = bajo.length;
    this.productosStock = bajo.length + normal.length;

    const total = this.totalInventario || 1;
    this.porcentajeStock = Math.round((normal.length / total) * 100);
    this.porcentajeBajo = Math.round((bajo.length / total) * 100);
    this.porcentajeSin = Math.round((sinStock.length / total) * 100);
  }

  private calcularSemana(ventasValidas: any[], hoy: Date): void {
    this.etiquetasSemana = [];
    this.ventasSemana = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
      this.etiquetasSemana.push(this.dias[dia.getDay()]);
      this.ventasSemana.push(this.sumar(ventasValidas.filter(v => this.mismoDia(new Date(v.fecha), dia))));
    }
  }

  private calcularTopProductos(ventasValidas: any[], detalles: any[], productos: any[]): void {
    const idsValidos = new Set(ventasValidas.map(v => v.idVenta));
    const acumulado = new Map<number, number>();

    detalles
      .filter(d => idsValidos.has(d.idVenta))
      .forEach(d => acumulado.set(d.idProducto, (acumulado.get(d.idProducto) || 0) + Number(d.cantidad || 0)));

    this.topProductos = Array.from(acumulado.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([idProducto, cantidad]) => {
        const producto = productos.find(p => p.idProducto === idProducto);
        return {
          nombre: producto ? producto.nombre : 'Producto #' + idProducto,
          ventas: cantidad,
          imagen: producto && producto.imagenUrl ? producto.imagenUrl : null
        };
      });

    this.maxVentasTop = this.topProductos.length > 0 ? this.topProductos[0].ventas : 1;
  }

  private calcularAlertas(inventario: any[]): void {
    const criticas: Alerta[] = inventario
      .filter(i => i.stockActual <= 0)
      .map(i => ({ tipo: 'Sin Stock', mensaje: '"' + i.producto?.nombre + '" está sin stock', clase: 'danger' }));

    const bajas: Alerta[] = inventario
      .filter(i => i.stockActual > 0 && i.stockActual <= i.stockMinimo)
      .map(i => ({
        tipo: 'Stock Bajo',
        mensaje: '"' + i.producto?.nombre + '" con ' + i.stockActual + ' unidades (mínimo ' + i.stockMinimo + ')',
        clase: 'warning'
      }));

    this.alertas = [...criticas, ...bajas].slice(0, 6);
  }

  private calcularActividades(ventasValidas: any[], comprasValidas: any[]): void {
    const deVentas: Actividad[] = ventasValidas.map(v => ({
      icono: '🛒',
      color: 'green',
      mensaje: 'Venta #' + v.idVenta + ' por Bs. ' + Number(v.total).toFixed(2),
      tiempo: this.haceTiempo(new Date(v.fecha)),
      fecha: new Date(v.fecha).getTime()
    }));

    const deCompras: Actividad[] = comprasValidas.map(c => ({
      icono: '📦',
      color: 'blue',
      mensaje: 'Compra #' + c.idCompra + ' por Bs. ' + Number(c.total).toFixed(2),
      tiempo: this.haceTiempo(new Date(c.fecha)),
      fecha: new Date(c.fecha).getTime()
    }));

    this.actividades = [...deVentas, ...deCompras]
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 6);
  }

  private haceTiempo(fecha: Date): string {
    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return 'Hace ' + minutos + ' min';
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return 'Hace ' + horas + ' h';
    return 'Hace ' + Math.floor(horas / 24) + ' d';
  }

  crearGraficos(): void {
    if (this.ventasChart) this.crearGraficoVentas();
    if (this.stockChart) this.crearGraficoStock();
  }

  crearGraficoVentas(): void {
    if (this.chartVentasInstance) this.chartVentasInstance.destroy();

    this.chartVentasInstance = new Chart(this.ventasChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.etiquetasSemana,
        datasets: [{
          label: 'Ventas (Bs.)',
          data: this.ventasSemana,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderColor: '#2563eb',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#2563eb',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: this.isDarkMode ? '#334155' : '#f1f5f9' }, ticks: { color: this.isDarkMode ? '#cbd5e1' : '#64748b', callback: (value) => 'Bs. ' + value } },
          x: { grid: { display: false }, ticks: { color: this.isDarkMode ? '#cbd5e1' : '#64748b' } }
        }
      }
    });
  }

  crearGraficoStock(): void {
    if (this.chartStockInstance) this.chartStockInstance.destroy();

    const normal = this.totalInventario - this.productosStockBajo - this.productosSinStock;

    this.chartStockInstance = new Chart(this.stockChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['En Stock', 'Stock Bajo', 'Sin Stock'],
        datasets: [{
          data: [normal, this.productosStockBajo, this.productosSinStock],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          hoverOffset: 4,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
  }
}
