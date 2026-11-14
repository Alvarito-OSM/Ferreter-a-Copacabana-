import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  isDarkMode: boolean = false;
  fechaActual: Date = new Date(); // 👈 Variable corregida

  ventasHoy: number = 0;
  productosStock: number = 0;
  productosStockBajo: number = 0;
  comprasMes: number = 0;

  topProductos: any[] = [];
  alertas: any[] = [];
  actividades: any[] = [];

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
    // AQUÍ CONECTAS CON TU BACKEND EN EL FUTURO
    // Ejemplo: this.http.get('http://localhost:8080/api/dashboard/kpis').subscribe(...)
    
    setTimeout(() => {
      this.ventasHoy = 12450;
      this.productosStock = 2845;
      this.productosStockBajo = 18;
      this.comprasMes = 28730;

      this.topProductos = [
        { nombre: 'Taladro Eléctrico 750W', ventas: 245, imagen: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=50' },
        { nombre: 'Martillo de 16 oz', ventas: 180, imagen: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=50' },
        { nombre: 'Wincha 5 m', ventas: 142, imagen: 'https://images.unsplash.com/photo-1584473457406-6c3b9b3f6735?q=80&w=50' },
        { nombre: 'Alicate Universal', ventas: 120, imagen: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=50' }
      ];

      this.alertas = [
        { tipo: 'Stock Crítico', mensaje: 'Quedan solo 5 unidades de "Disco de Corte 7"', clase: 'danger' },
        { tipo: 'Stock Bajo', mensaje: 'Producto "Cemento 50kg" con stock bajo (12 unidades)', clase: 'warning' }
      ];

      this.actividades = [
        { icono: '🛒', color: 'green', mensaje: 'Venta realizada por Bs. 320', tiempo: 'Hace 5 min' },
        { icono: '📦', color: 'blue', mensaje: 'Ingreso de mercadería: 50 unidades', tiempo: 'Hace 20 min' },
        { icono: '✏️', color: 'yellow', mensaje: 'Stock actualizado: Taladro 750W', tiempo: 'Hace 1 h' }
      ];

      this.crearGraficos();
    }, 500);
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
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Ventas (Bs.)',
          data: [7000, 8500, 10000, 10500, 9000, 10000, this.ventasHoy],
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
          y: { beginAtZero: true, grid: { color: this.isDarkMode ? '#334155' : '#f1f5f9' }, ticks: { color: this.isDarkMode ? '#cbd5e1' : '#64748b', callback: (value) => value + 'k' } },
          x: { grid: { display: false }, ticks: { color: this.isDarkMode ? '#cbd5e1' : '#64748b' } }
        }
      }
    });
  }

  crearGraficoStock(): void {
    if (this.chartStockInstance) this.chartStockInstance.destroy();

    this.chartStockInstance = new Chart(this.stockChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['En Stock', 'Stock Bajo', 'Sin Stock'],
        datasets: [{
          data: [78, 13, 9],
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
