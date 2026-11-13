import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html', // Asegúrate de que coincida con tu archivo HTML
  styleUrls: ['./dashboard.component.css']   // Asegúrate de que coincida con tu archivo CSS
})
export class DashboardComponent implements OnInit, AfterViewInit {

  // Variables dinámicas
  totalVentasHoy: number = 0;
  productosBajoStock: number = 0;
  clientesRegistrados: number = 0;
  gananciasMes: number = 0;

  @ViewChild('ventasChart') ventasChart!: ElementRef;
  @ViewChild('stockChart') stockChart!: ElementRef;

  constructor(private authService: AuthService, private http: HttpClient) {}

  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  get rol(): string {
    return (this.authService.getRol() || '').replace('ROLE_', '');
  }

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas() {
    this.http.get<any>('http://localhost:8080/api/dashboard/metricas').subscribe({
      next: (data) => {
        this.totalVentasHoy = data.ventasHoy;
        this.gananciasMes = data.gananciasMes;
        this.productosBajoStock = data.productosBajoStock;
        this.clientesRegistrados = data.clientesTotales;
      },
      error: (err) => console.error('Error al cargar métricas del dashboard', err)
    });
  }

  ngAfterViewInit(): void {
    this.crearGraficoVentas();
    this.crearGraficoStock();
  }

  crearGraficoVentas() {
    new Chart(this.ventasChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Ventas de la semana (Bs.)',
          data: [1200, 1900, 1500, 2200, 2800, 3500, 2300], // Luego puedes hacer esto dinámico también
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        }
      }
    });
  }

  crearGraficoStock() {
    new Chart(this.stockChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Stock Saludable', 'Stock Bajo', 'Agotado'],
        datasets: [{
          // Aquí podrías usar this.productosBajoStock para hacerlo dinámico
          data: [150, this.productosBajoStock, 2], 
          backgroundColor: ['#4ade80', '#fbbf24', '#f87171'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        cutout: '70%'
      }
    });
  }
}
