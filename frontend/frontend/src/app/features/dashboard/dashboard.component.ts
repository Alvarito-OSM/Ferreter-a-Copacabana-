import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html', 
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  // Datos del usuario
  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  // Métricas
  ventasHoy: number = 12450;
  productosStock: number = 2845;
  productosStockBajo: number = 18;
  comprasMes: number = 28730;

  // Para la tabla de productos más vendidos (Datos de ejemplo)
  topProductos = [
    { nombre: 'Taladro Eléctrico 750W', ventas: 245, imagen: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=50' },
    { nombre: 'Martillo de 16 oz', ventas: 180, imagen: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=50' },
    { nombre: 'Wincha 5 m', ventas: 142, imagen: 'https://images.unsplash.com/photo-1584473457406-6c3b9b3f6735?q=80&w=50' },
    { nombre: 'Alicate Universal', ventas: 120, imagen: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=50' },
    { nombre: 'Tornillo 1"', ventas: 98, imagen: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=50' }
  ];

  // Alertas
  alertas = [
    { tipo: 'Stock Crítico', mensaje: 'Quedan solo 5 unidades de "Disco de Corte 7"', clase: 'danger' },
    { tipo: 'Stock Bajo', mensaje: 'Producto "Cemento 50kg" con stock bajo (12 unidades)', clase: 'warning' }
  ];

  @ViewChild('ventasChart') ventasChart!: ElementRef;
  @ViewChild('stockChart') stockChart!: ElementRef;

  constructor(
    private authService: AuthService, 
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Aquí puedes conectar a tu API real para actualizar ventasHoy, etc.
  }

  ngAfterViewInit(): void {
    this.crearGraficoVentas();
    this.crearGraficoStock();
  }

  crearGraficoVentas() {
    new Chart(this.ventasChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Lun 07/11', 'Mar 08/11', 'Mié 09/11', 'Jue 10/11', 'Vie 11/11', 'Sáb 12/11', 'Dom 13/11'],
        datasets: [{
          label: 'Ventas (Bs.)',
          data: [7000, 8500, 10000, 10500, 9000, 10000, 12450],
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
          y: { 
            beginAtZero: true, 
            grid: { color: '#f1f5f9' },
            ticks: { callback: (value) => value + 'k' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  crearGraficoStock() {
    new Chart(this.stockChart.nativeElement, {
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
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
