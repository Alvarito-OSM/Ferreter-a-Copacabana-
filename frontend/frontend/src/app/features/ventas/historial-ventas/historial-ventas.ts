import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-ventas.html',
  styleUrls: ['./historial-ventas.css']
})
export class HistorialVentasComponent implements OnInit {
  
  ventas: any[] = []; 
  cargando: boolean = true;
  
  apiUrl = 'http://localhost:8080/api';

  // --- VARIABLES PARA EL MODAL DEL POS ---
  modalAbierto: boolean = false;
  productos: any[] = [];
  clientes: any[] = [];
  busqueda: string = '';
  carrito: any[] = [];
  
  idCliente: number | null = null;
  metodoPago: string = 'EFECTIVO';
  montoRecibido: number = 0;
  subtotal: number = 0;
  total: number = 0;
  cambio: number = 0;

  creandoCliente: boolean = false;
  nuevoCliente: any = { nombre: '', apellido: '', cedulaNit: '', telefono: '' };

  constructor(
    private http: HttpClient, 
    public authService: AuthService,
    private cdRef: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarProductos();
    this.cargarClientes();
  }

  cargarVentas() {
    this.cargando = true;
    this.http.get<any[]>(`${this.apiUrl}/ventas`).subscribe({
      next: (data) => {
        this.ventas = data; 
        this.cargando = false; 
        this.cdRef.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        this.cargando = false; 
        this.cdRef.detectChanges();
      }
    });
  }

  anularVenta(idVenta: number) {
    if (!confirm('¿Anular esta venta? El stock será devuelto.')) return;
    this.http.put(`${this.apiUrl}/ventas/${idVenta}/anular`, {}).subscribe({
      next: () => {
        alert('Venta anulada');
        this.cargarVentas();
        this.cargarProductos(); 
      },
      error: (err) => alert('Error al anular: ' + err.message)
    });
  }

  esAdmin(): boolean {
    return (this.authService.getRol() || '').includes('ADMIN');
  }

  abrirModal() {
    this.modalAbierto = true;
    this.limpiarPOS();
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  cargarProductos() {
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe(data => this.productos = data);
  }

  cargarClientes() {
    this.http.get<any[]>(`${this.apiUrl}/clientes`).subscribe(data => {
      this.clientes = data;
      this.cdRef.detectChanges();
    });
  }

  filtrarProductos() {
    if (!this.busqueda) return this.productos;
    return this.productos.filter(p => 
      p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) || 
      p.codigoBarras.includes(this.busqueda)
    );
  }

  agregarAlCarrito(producto: any) {
    const item = this.carrito.find(c => c.idProducto === producto.idProducto);
    if (item) item.cantidad++;
    else this.carrito.push({ idProducto: producto.idProducto, nombre: producto.nombre, precioUnitario: producto.precioVenta, cantidad: 1 });
    this.calcularTotales();
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
    this.total = this.subtotal; 
    this.calcularCambio();
  }

  // 👇 CORREGIDO: El cambio solo aplica para efectivo
  calcularCambio() {
    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido > 0) {
      this.cambio = this.montoRecibido - this.total;
    } else {
      this.cambio = 0;
    }
  }

  guardarNuevoCliente() {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.cedulaNit) {
      return alert('Nombre y Cédula/NIT son obligatorios');
    }
    this.http.post(`${this.apiUrl}/clientes`, this.nuevoCliente).subscribe({
      next: (res: any) => {
        alert('Cliente registrado');
        this.cargarClientes();
        this.idCliente = res.idCliente; 
        this.creandoCliente = false;
        this.nuevoCliente = { nombre: '', apellido: '', cedulaNit: '', telefono: '' };
      },
      error: () => alert('Error al crear cliente')
    });
  }

  finalizarVenta() {
    if (this.carrito.length === 0) return alert('Carrito vacío');
    if (!this.idCliente) return alert('Debe seleccionar o crear un cliente');

    const idEmpleado = 2; 

    const ventaData = {
      idCliente: Number(this.idCliente),
      idEmpleado: idEmpleado,
      metodoPago: this.metodoPago,
      montoRecibido: this.montoRecibido,
      detalles: this.carrito.map(c => ({ idProducto: c.idProducto, cantidad: c.cantidad }))
    };

    this.http.post(`${this.apiUrl}/ventas`, ventaData).subscribe({
      next: (res: any) => {
        alert(`¡Venta exitosa! Total: Bs. ${res.total}`);
        this.cerrarModal();
        this.cargarVentas(); 
        this.cargarProductos(); 
      },
      error: (err) => alert('Error: ' + (err.error || 'Verifique el stock'))
    });
  }

  limpiarPOS() {
    this.carrito = [];
    this.subtotal = 0;
    this.total = 0;
    this.montoRecibido = 0;
    this.cambio = 0;
    this.idCliente = null;
    this.creandoCliente = false;
    this.metodoPago = 'EFECTIVO'; // Resetea el método de pago
  }

  calcularTotalVentas(): number {
    if (!this.ventas) return 0; 
    return this.ventas
      .filter(v => v.estado === 'COMPLETADA')
      .reduce((acc, v) => acc + Number(v.total), 0);
  }

  ventasCompletadas(): number {
    if (!this.ventas) return 0; 
    return this.ventas.filter(v => v.estado === 'COMPLETADA').length;
  }

  calcularTicketPromedio(): number {
    const total = this.calcularTotalVentas();
    const cantidad = this.ventasCompletadas();
    return cantidad > 0 ? (total / cantidad) : 0;
  }

  obtenerNombreCliente(idCliente: number): string {
    if (!this.clientes || this.clientes.length === 0) return 'Cargando...';
    const cliente = this.clientes.find(c => c.idCliente === idCliente);
    if (cliente) {
      return `${cliente.nombre} ${cliente.apellido || ''}`.trim();
    }
    return 'Cliente Desconocido';
  }
}
