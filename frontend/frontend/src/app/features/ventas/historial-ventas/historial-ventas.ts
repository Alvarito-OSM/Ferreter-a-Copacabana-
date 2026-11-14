import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs'; // 👈 IMPORTANTE: Importamos forkJoin

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

  totalUnidadesStock: number = 0;

  // --- VARIABLES DEL MODAL POS ---
  modalAbierto: boolean = false;
  productos: any[] = [];
  productosFiltrados: any[] = [];
  clientes: any[] = [];
  carrito: any[] = [];
  
  busquedaCliente: string = '';
  clientesFiltrados: any[] = [];
  mostrarDropdownClientes: boolean = false;
  idCliente: number | null = null;
  clienteSeleccionado: any = null;

  busquedaProducto: string = '';
  
  metodoPago: 'EFECTIVO' | 'QR' = 'EFECTIVO';
  montoRecibido: number = 0;
  cambio: number = 0;
  
  total: number = 0;

  creandoCliente: boolean = false;
  nuevoCliente: any = { nombre: '', apellido: '', cedulaNit: '', telefono: '' };

  constructor(
    private http: HttpClient, 
    public authService: AuthService,
    private cdRef: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarClientes();
    this.cargarProductos(); 
  }

  cargarVentas() {
    this.cargando = true;
    this.http.get<any[]>(`${this.apiUrl}/ventas`).subscribe({
      next: (data) => {
        this.ventas = data.reverse(); 
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
        this.cargarProductos(); // Recargamos el stock
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

  // 👇 AQUÍ ESTÁ LA MAGIA PARA QUE EL STOCK SE VEA EN EL FRONTEND 👇
  cargarProductos() {
    // Pedimos productos e inventario al mismo tiempo
    forkJoin({
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`),
      inventarios: this.http.get<any[]>(`${this.apiUrl}/inventario`)
    }).subscribe({
      next: (data) => {
        // Cruzamos los datos: Si Java no manda el inventario, lo buscamos en la tabla inventarios
        this.productos = data.productos.map(prod => {
          const inv = data.inventarios.find(i => i.producto?.idProducto === prod.idProducto);
          return { ...prod, inventario: inv || null };
        }).filter(p => p.estado); // Solo mostramos los activos

        this.filtrarProductos(); 
        
        // Ahora sí, sumamos todo el stock real de la base de datos
        this.totalUnidadesStock = this.productos.reduce((acc, prod) => {
          return acc + (prod.inventario?.stockActual || 0);
        }, 0);
        
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos e inventario', err)
    });
  }

  cargarClientes() {
    this.http.get<any[]>(`${this.apiUrl}/clientes`).subscribe(data => {
      this.clientes = data;
      this.clientesFiltrados = data;
      this.cdRef.detectChanges();
    });
  }

  filtrarClientes() {
    const term = this.busquedaCliente.toLowerCase().trim();
    if (!term) {
      this.clientesFiltrados = this.clientes;
    } else {
      this.clientesFiltrados = this.clientes.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        (c.apellido && c.apellido.toLowerCase().includes(term)) ||
        c.cedulaNit.includes(term)
      );
    }
  }

  seleccionarCliente(c: any) {
    this.idCliente = c.idCliente;
    this.clienteSeleccionado = c;
    this.busquedaCliente = `${c.nombre} ${c.apellido || ''}`;
    this.mostrarDropdownClientes = false;
  }

  filtrarProductos() {
    if (!this.busquedaProducto) {
      this.productosFiltrados = this.productos;
      return;
    }
    const term = this.busquedaProducto.toLowerCase();
    this.productosFiltrados = this.productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      (p.codigoBarras && p.codigoBarras.includes(term))
    );
  }

  agregarAlCarrito(producto: any) {
    // Validación extra: No dejar agregar si no hay stock
    const stockDisponible = producto.inventario?.stockActual || 0;
    if (stockDisponible <= 0) return alert('Producto sin stock');

    const item = this.carrito.find(c => c.idProducto === producto.idProducto);
    if (item) {
      if (item.cantidad + 1 > stockDisponible) return alert('No hay más stock de este producto');
      item.cantidad++;
    } else {
      this.carrito.push({ 
        idProducto: producto.idProducto, 
        nombre: producto.nombre, 
        precioUnitario: producto.precioVenta, 
        cantidad: 1 
      });
    }
    this.calcularTotales();
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.total = this.carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
    this.calcularCambio(); 
  }

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
        this.clienteSeleccionado = res;
        this.busquedaCliente = res.nombre;
        this.creandoCliente = false;
        this.nuevoCliente = { nombre: '', apellido: '', cedulaNit: '', telefono: '' };
      },
      error: () => alert('Error al crear cliente')
    });
  }

  finalizarVenta() {
    if (this.carrito.length === 0) return alert('El carrito está vacío');
    if (!this.idCliente) return alert('Debe seleccionar o registrar un cliente');
    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < this.total) {
      return alert('El monto recibido es insuficiente.');
    }

    const ventaData = {
      idCliente: Number(this.idCliente),
      idEmpleado: 2, // 👈 ¡OJO AQUÍ! Si te sigue dando Error 400, es porque Java exige este campo.
      metodoPago: this.metodoPago,
      montoRecibido: this.metodoPago === 'EFECTIVO' ? this.montoRecibido : this.total,
      detalles: this.carrito.map(c => ({ idProducto: c.idProducto, cantidad: c.cantidad }))
    };

    this.http.post(`${this.apiUrl}/ventas`, ventaData).subscribe({
      next: (res: any) => {
        alert(`¡Venta exitosa! Total: Bs. ${res.total}`);
        this.cerrarModal();
        this.cargarVentas(); 
        this.cargarProductos(); // Recargamos stock para la tarjeta
      },
      error: (err) => alert('Error: ' + (err.error?.message || 'Verifique el stock y que el idEmpleado exista.'))
    });
  }

  limpiarPOS() {
    this.carrito = [];
    this.total = 0;
    this.idCliente = null;
    this.clienteSeleccionado = null;
    this.busquedaCliente = '';
    this.busquedaProducto = '';
    this.creandoCliente = false;
    this.metodoPago = 'EFECTIVO';
    this.montoRecibido = 0;
    this.cambio = 0;
  }

  // --- MÉTRICAS ---
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
    if (cliente) return `${cliente.nombre} ${cliente.apellido || ''}`.trim();
    return 'Cliente Desconocido';
  }
}
