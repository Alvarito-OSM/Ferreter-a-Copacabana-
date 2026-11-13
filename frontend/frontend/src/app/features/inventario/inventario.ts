import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {

  // Variables para la tabla
  productos: any[] = [];
  filtroBusqueda: string = '';
  filtroCategoria: string = '';
  filtroEstado: string = '';
  apiUrl = 'http://localhost:8080/api';

  // Variable para controlar la pestaña activa
  pestanaActiva: string = 'eoq'; 

  // 👇 VARIABLES PARA LOS MODELOS DE INV. OPERATIVA 👇
  
  // 1. EOQ, Punto de Reorden y Stock de Seguridad
  eoqDatos = { demandaAnual: 12000, costoPedido: 50, costoMantenimiento: 2.5, tiempoEntregaDias: 10, desviacionEstandar: 15, nivelServicio: 1.65 };
  eoqResultados: any = null;

  // 2. Pronóstico de Demanda (Promedio Móvil)
  demandaHistorica: number[] = [150, 160, 155, 170, 180, 175, 190];
  pronosticoResultados: any = null;

  // 3. Programación Lineal (Maximizar Ganancias)
  linealDatos = { h1: 10, h2: 15, h3: 20, horasDisponibles: 100, maderaDisponible: 200, maderaH1: 2, maderaH2: 3, maderaH3: 4 };
  linealResultados: any = null;

  // 4. Modelo de Colas (M/M/1)
  colasDatos = { tasaLLegada: 5, tasaServicio: 6 };
  colasResultados: any = null;

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe({
      next: (data) => {
        this.productos = data;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  // 👇 FUNCIONES PARA LAS TARJETAS DE MÉTRICAS 👇
  get totalItems(): number {
    return this.productos.length;
  }

  get activeItems(): number {
    return this.productos.filter(p => p.estado).length;
  }

  get lowStockItems(): number {
    return this.productos.filter(p => p.inventario && p.inventario.stockActual <= p.inventario.stockMinimo && p.inventario.stockActual > 0).length;
  }

  get outOfStockItems(): number {
    return this.productos.filter(p => !p.inventario || p.inventario.stockActual === 0).length;
  }

  // 👇 FUNCIÓN PARA FILTRAR LA TABLA 👇
  get productosFiltrados() {
    return this.productos.filter(p => {
      const matchBusqueda = p.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) || 
                            p.codigoBarras.includes(this.filtroBusqueda);
      const matchCategoria = this.filtroCategoria ? p.categoria?.nombre === this.filtroCategoria : true;
      
      let matchEstado = true;
      const stock = p.inventario ? p.inventario.stockActual : 0;
      const stockMin = p.inventario ? p.inventario.stockMinimo : 5;

      if (this.filtroEstado === 'bajo') matchEstado = stock <= stockMin && stock > 0;
      if (this.filtroEstado === 'agotado') matchEstado = stock === 0;

      return matchBusqueda && matchCategoria && matchEstado;
    });
  }

  // --- LÓGICA MATEMÁTICA DE LOS MODELOS ---

  calcularEOQ() {
    const { demandaAnual, costoPedido, costoMantenimiento, tiempoEntregaDias, desviacionEstandar, nivelServicio } = this.eoqDatos;
    
    const qOptimo = Math.sqrt((2 * demandaAnual * costoPedido) / costoMantenimiento);
    const demandaDiaria = demandaAnual / 365;
    const stockSeguridad = nivelServicio * desviacionEstandar * Math.sqrt(tiempoEntregaDias);
    const puntoReorden = (demandaDiaria * tiempoEntregaDias) + stockSeguridad;

    this.eoqResultados = {
      qOptimo: qOptimo.toFixed(2),
      puntoReorden: puntoReorden.toFixed(2),
      stockSeguridad: stockSeguridad.toFixed(2),
      costoTotal: ((demandaAnual / qOptimo) * costoPedido + (qOptimo / 2) * costoMantenimiento).toFixed(2)
    };
  }

  calcularPronostico() {
    const n = 3;
    const ultimos = this.demandaHistorica.slice(-n);
    const promedio = ultimos.reduce((a, b) => a + b, 0) / n;
    
    this.pronosticoResultados = {
      pronosticoProximoMes: promedio.toFixed(0),
      historial: this.demandaHistorica
    };
  }

  calcularLineal() {
    const { h1, h2, h3, horasDisponibles, maderaDisponible, maderaH1, maderaH2, maderaH3 } = this.linealDatos;
    
    const rentH1 = h1 / maderaH1;
    const rentH2 = h2 / maderaH2;
    const rentH3 = h3 / maderaH3;

    const productos = [
      { nombre: 'Producto 1', rent: rentH1, madera: maderaH1, ganancia: h1 },
      { nombre: 'Producto 2', rent: rentH2, madera: maderaH2, ganancia: h2 },
      { nombre: 'Producto 3', rent: rentH3, madera: maderaH3, ganancia: h3 }
    ].sort((a, b) => b.rent - a.rent);

    let maderaRestante = maderaDisponible;
    let gananciaTotal = 0;
    const produccion: any = {};

    for (let prod of productos) {
      const cantidad = Math.floor(maderaRestante / prod.madera);
      produccion[prod.nombre] = cantidad;
      gananciaTotal += cantidad * prod.ganancia;
      maderaRestante -= cantidad * prod.madera;
    }

    this.linealResultados = {
      produccion,
      gananciaTotal: gananciaTotal.toFixed(2),
      maderaSobrante: maderaRestante
    };
  }

  calcularColas() {
    const { tasaLLegada, tasaServicio } = this.colasDatos;
    
    if (tasaLLegada >= tasaServicio) {
      alert('La tasa de llegada debe ser menor a la tasa de servicio.');
      return;
    }

    const utilizacion = tasaLLegada / tasaServicio;
    const longitudPromedioCola = (tasaLLegada ** 2) / (tasaServicio * (tasaServicio - tasaLLegada));
    const tiempoPromedioCola = tasaLLegada / (tasaServicio * (tasaServicio - tasaLLegada));
    const tiempoPromedioSistema = 1 / (tasaServicio - tasaLLegada);

    this.colasResultados = {
      utilizacion: (utilizacion * 100).toFixed(2) + '%',
      longitudCola: longitudPromedioCola.toFixed(2),
      tiempoCola: (tiempoPromedioCola * 60).toFixed(2) + ' min',
      tiempoSistema: (tiempoPromedioSistema * 60).toFixed(2) + ' min'
    };
  }
}
