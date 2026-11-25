import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface DetalleCompra {
  idProducto: number;
  nombre: string;
  cantidad: number;
  costo: number;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrls: ['./compras.css']
})
export class ComprasComponent implements OnInit {
  
  apiUrl = 'http://localhost:8080/api';

  proveedores: any[] = [];
  productos: any[] = [];
  compras: any[] = [];
  
  // Variables del formulario
  idProveedor: number | null = null;
  idProducto: number | null = null;
  cantidad: number = 1;
  costo: number = 0;
  detalles: DetalleCompra[] = [];
  mensaje: string = '';
  exito: string = '';
  cargando: boolean = false;

  // Variables de la interfaz
  textoBusqueda: string = '';
  filtroEstado: string = 'TODAS';
  filtroProveedor: string = 'TODOS';
  
  modalCompraAbierto: boolean = false;
  modalDetalleAbierto: boolean = false;
  compraSeleccionada: any = null;
  detallesCompraSeleccionada: any[] = [];
  
  // Métricas
  totalInvertido: number = 0;
  comprasRealizadas: number = 0;
  ticketPromedio: number = 0;

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      proveedores: this.http.get<any[]>(`${this.apiUrl}/proveedores`),
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`),
      compras: this.http.get<any[]>(`${this.apiUrl}/compras`)
    }).subscribe({
      next: (data) => {
        this.proveedores = data.proveedores.filter(p => p.estado);
        this.productos = data.productos.filter(p => p.estado);
        this.compras = data.compras
          .filter(c => c.estado !== 'ANULADA')
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          
        this.calcularMetricas();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  calcularMetricas() {
    this.comprasRealizadas = this.compras.length;
    this.totalInvertido = this.compras.reduce((acc, c) => acc + Number(c.total), 0);
    this.ticketPromedio = this.comprasRealizadas > 0 ? (this.totalInvertido / this.comprasRealizadas) : 0;
  }

  get comprasFiltradas() {
    return this.compras.filter(c => {
      const matchBusqueda = this.textoBusqueda === '' || 
                            c.idCompra.toString().includes(this.textoBusqueda) || 
                            this.nombreProveedor(c.idProveedor).toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const matchEstado = this.filtroEstado === 'TODAS' || c.estado === this.filtroEstado;
      const matchProveedor = this.filtroProveedor === 'TODOS' || c.idProveedor.toString() === this.filtroProveedor;
      
      return matchBusqueda && matchEstado && matchProveedor;
    });
  }

  onProductoChange() {
    if (this.idProducto) {
      const prod = this.productos.find(p => p.idProducto === Number(this.idProducto));
      if (prod) this.costo = prod.precioCompra;
    }
  }

  nombreProveedor(id: number): string {
    const prov = this.proveedores.find(p => p.idProveedor === id);
    return prov ? prov.razonSocial : 'Proveedor #' + id;
  }

  get total(): number {
    return this.detalles.reduce((suma, p) => suma + (p.cantidad * p.costo), 0);
  }

  agregarProducto(): void {
    this.mensaje = '';
    if (!this.idProducto || this.cantidad <= 0 || this.costo <= 0) {
      this.mensaje = 'Completa los datos del producto correctamente.';
      return;
    }

    const prodSeleccionado = this.productos.find(p => p.idProducto === Number(this.idProducto));
    if (!prodSeleccionado) return;

    const existente = this.detalles.find(d => d.idProducto === prodSeleccionado.idProducto);

    if (existente) {
      existente.cantidad += Number(this.cantidad);
      existente.costo = Number(this.costo);
    } else {
      this.detalles.push({
        idProducto: prodSeleccionado.idProducto,
        nombre: prodSeleccionado.nombre,
        cantidad: Number(this.cantidad),
        costo: Number(this.costo)
      });
    }

    this.idProducto = null;
    this.cantidad = 1;
    this.costo = 0;
  }

  quitarProducto(indice: number): void {
    this.detalles.splice(indice, 1);
  }

  abrirModalCompra() {
    this.modalCompraAbierto = true;
    this.limpiarFormulario();
  }

  cerrarModalCompra() {
    this.modalCompraAbierto = false;
  }

  limpiarFormulario() {
    this.idProveedor = null;
    this.idProducto = null;
    this.cantidad = 1;
    this.costo = 0;
    this.detalles = [];
    this.mensaje = '';
    this.exito = '';
  }

  registrarCompra(): void {
    this.mensaje = '';
    this.exito = '';

    const idAdministrador = this.authService.getId();
    if (idAdministrador === null) {
      this.mensaje = 'Vuelve a iniciar sesión como administrador.';
      return;
    }
    if (!this.idProveedor) {
      this.mensaje = 'Selecciona un proveedor.';
      return;
    }
    if (this.detalles.length === 0) {
      this.mensaje = 'Agrega al menos un producto.';
      return;
    }

    this.cargando = true;

    const compraData = {
      idProveedor: Number(this.idProveedor),
      idAdministrador: idAdministrador,
      detalles: this.detalles.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        precioUnitario: d.costo
      }))
    };

    this.http.post(`${this.apiUrl}/compras/completa`, compraData).subscribe({
      next: (res: any) => {
        this.exito = 'Compra registrada exitosamente.';
        this.cargando = false;
        this.cargarDatos();
        setTimeout(() => this.cerrarModalCompra(), 1500);
      },
      error: (err) => {
        this.mensaje = 'Error: ' + (err.error?.message || err.error?.error || 'Revisa los datos.');
        this.cargando = false;
      }
    });
  }

  verDetalle(compra: any) {
    this.compraSeleccionada = compra;
    this.modalDetalleAbierto = true;
    this.http.get<any[]>(`${this.apiUrl}/compras/${compra.idCompra}/detalles`).subscribe({
      next: (detalles) => {
        this.detallesCompraSeleccionada = detalles;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar detalles', err)
    });
  }

  cerrarModalDetalle() {
    this.modalDetalleAbierto = false;
    this.compraSeleccionada = null;
    this.detallesCompraSeleccionada = [];
  }

  // Acciones simuladas para los nuevos iconos
  editarCompra(c: any) { alert('Función de editar compra #' + c.idCompra); }
  descargarPDF(c: any) { alert('Descargando PDF de la compra #' + c.idCompra); }
}
