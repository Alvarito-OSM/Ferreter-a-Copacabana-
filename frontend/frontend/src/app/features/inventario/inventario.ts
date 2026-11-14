import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {

  productos: any[] = [];
  categorias: string[] = [];
  filtroBusqueda: string = '';
  filtroCategoria: string = '';
  filtroEstado: string = '';
  apiUrl = 'http://localhost:8080/api';

  pestanaActiva: string = 'eoq'; 

  eoqDatos = { demandaAnual: 12000, costoPedido: 50, costoMantenimiento: 2.5, tiempoEntregaDias: 10, desviacionEstandar: 15, nivelServicio: 1.65 };
  eoqResultados: any = null;

  demandaHistorica: number[] = [150, 160, 155, 170, 180, 175, 190];
  pronosticoResultados: any = null;

  linealDatos = { h1: 10, h2: 15, h3: 20, horasDisponibles: 100, maderaDisponible: 200, maderaH1: 2, maderaH2: 3, maderaH3: 4 };
  linealResultados: any = null;

  colasDatos = { tasaLLegada: 5, tasaServicio: 6 };
  colasResultados: any = null;

  mostrarModalStock: boolean = false;
  productoSeleccionado: number | null = null;
  cantidadIngreso: number = 0;
  procesando: boolean = false;

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`),
      inventarios: this.http.get<any[]>(`${this.apiUrl}/inventario`)
    }).subscribe({
      next: (data) => {
        this.productos = data.productos.map(prod => {
          const inv = data.inventarios.find(i => i.producto?.idProducto === prod.idProducto);
          return { ...prod, inventario: inv || null };
        });

        const cats = this.productos.map(p => p.categoria?.nombre).filter(Boolean);
        this.categorias = [...new Set(cats)];
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  abrirModalStock() {
    this.mostrarModalStock = true;
    this.productoSeleccionado = null;
    this.cantidadIngreso = 0;
  }

  cerrarModalStock() {
    this.mostrarModalStock = false;
  }

  guardarStock() {
    if (!this.productoSeleccionado || this.cantidadIngreso <= 0) return;

    this.procesando = true;

    const payload = {
      idProducto: this.productoSeleccionado,
      cantidad: this.cantidadIngreso,
      tipoMovimiento: 'ENTRADA',
      motivo: 'Ingreso de mercadería'
    };

    this.http.post(`${this.apiUrl}/inventario/ajustes`, payload).subscribe({
      next: () => {
        alert('Stock ingresado correctamente');
        this.procesando = false;
        this.cerrarModalStock();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al ingresar stock', err);
        alert('Error al guardar. Revisa la consola.');
        this.procesando = false;
      }
    });
  }

  // 👇 NUEVAS MÉTRICAS PARA LA CABECERA 👇
  get totalItems(): number { return this.productos.length; }
  
  get valorInventario(): number {
    return this.productos.reduce((acc, p) => {
      const stock = p.inventario ? p.inventario.stockActual : 0;
      const precio = p.precioCompra || 0;
      return acc + (stock * precio);
    }, 0);
  }

  get lowStockItems(): number {
    return this.productos.filter(p => {
      const stock = p.inventario ? p.inventario.stockActual : 0;
      const min = p.inventario ? p.inventario.stockMinimo : 5;
      return stock > 0 && stock <= min;
    }).length;
  }

  get outOfStockItems(): number {
    return this.productos.filter(p => (p.inventario ? p.inventario.stockActual : 0) === 0).length;
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const term = this.filtroBusqueda.toLowerCase();
      const matchBusqueda = p.nombre.toLowerCase().includes(term) || 
                            (p.codigoBarras && p.codigoBarras.includes(term));
      const matchCategoria = this.filtroCategoria ? p.categoria?.nombre === this.filtroCategoria : true;
      
      let matchEstado = true;
      const stock = p.inventario ? p.inventario.stockActual : 0;
      const stockMin = p.inventario ? p.inventario.stockMinimo : 5;

      if (this.filtroEstado === 'bajo') matchEstado = stock <= stockMin && stock > 0;
      if (this.filtroEstado === 'agotado') matchEstado = stock === 0;

      return matchBusqueda && matchCategoria && matchEstado;
    });
  }

  // ... (Tus funciones matemáticas de EOQ, Pronóstico, Lineal y Colas se mantienen exactamente igual) ...
  calcularEOQ() {
    const { demandaAnual, costoPedido, costoMantenimiento, tiempoEntregaDias, desviacionEstandar, nivelServicio } = this.eoqDatos;
    const qOptimo = Math.sqrt((2 * demandaAnual * costoPedido) / costoMantenimiento);
    const demandaDiaria = demandaAnual / 365;
    const stockSeguridad = nivelServicio * desviacionEstandar * Math.sqrt(tiempoEntregaDias);
    const puntoReorden = (demandaDiaria * tiempoEntregaDias) + stockSeguridad;
    this.eoqResultados = {
      qOptimo: qOptimo.toFixed(2), puntoReorden: puntoReorden.toFixed(2),
      stockSeguridad: stockSeguridad.toFixed(2),
      costoTotal: ((demandaAnual / qOptimo) * costoPedido + (qOptimo / 2) * costoMantenimiento).toFixed(2)
    };
  }

  calcularPronostico() {
    const n = 3; const ultimos = this.demandaHistorica.slice(-n);
    const promedio = ultimos.reduce((a, b) => a + b, 0) / n;
    this.pronosticoResultados = { pronosticoProximoMes: promedio.toFixed(0), historial: this.demandaHistorica };
  }

  calcularLineal() {
    const { h1, h2, h3, maderaDisponible, maderaH1, maderaH2, maderaH3 } = this.linealDatos;
    const productos = [
      { nombre: 'Producto 1', rent: h1 / maderaH1, madera: maderaH1, ganancia: h1 },
      { nombre: 'Producto 2', rent: h2 / maderaH2, madera: maderaH2, ganancia: h2 },
      { nombre: 'Producto 3', rent: h3 / maderaH3, madera: maderaH3, ganancia: h3 }
    ].sort((a, b) => b.rent - a.rent);
    let maderaRestante = maderaDisponible; let gananciaTotal = 0; const produccion: any = {};
    for (let prod of productos) {
      const cantidad = Math.floor(maderaRestante / prod.madera);
      produccion[prod.nombre] = cantidad; gananciaTotal += cantidad * prod.ganancia; maderaRestante -= cantidad * prod.madera;
    }
    this.linealResultados = { produccion, gananciaTotal: gananciaTotal.toFixed(2), maderaSobrante: maderaRestante };
  }

  calcularColas() {
    const { tasaLLegada, tasaServicio } = this.colasDatos;
    if (tasaLLegada >= tasaServicio) { alert('La tasa de llegada debe ser menor.'); return; }
    const utilizacion = tasaLLegada / tasaServicio;
    const longitudPromedioCola = (tasaLLegada ** 2) / (tasaServicio * (tasaServicio - tasaLLegada));
    const tiempoPromedioCola = tasaLLegada / (tasaServicio * (tasaServicio - tasaLLegada));
    const tiempoPromedioSistema = 1 / (tasaServicio - tasaLLegada);
    this.colasResultados = {
      utilizacion: (utilizacion * 100).toFixed(2) + '%', longitudCola: longitudPromedioCola.toFixed(2),
      tiempoCola: (tiempoPromedioCola * 60).toFixed(2) + ' min', tiempoSistema: (tiempoPromedioSistema * 60).toFixed(2) + ' min'
    };
  }
}
