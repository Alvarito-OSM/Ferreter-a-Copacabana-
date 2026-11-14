import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface ProductoVenta {
  idProducto: number;
  nombre: string;
  precioVenta: number;
  stockActual: number;
}

interface ItemVenta {
  producto: ProductoVenta;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class Ventas implements OnInit {
  productos: ProductoVenta[] = [];
  carrito: ItemVenta[] = [];

  productoId: number = 0;
  cantidad: number = 1;
  cliente: string = '';
  metodoPago: 'EFECTIVO' | 'QR' = 'EFECTIVO';
  montoRecibido: number = 0;
  mensaje: string = '';
  cargando: boolean = false;
  procesandoVenta: boolean = false;

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe({
      next: (data) => {
        // Mapeamos los datos del backend para que encajen con nuestra interfaz
        this.productos = data
          .filter(p => p.estado && p.inventario && p.inventario.stockActual > 0)
          .map(p => ({
            idProducto: p.idProducto,
            nombre: p.nombre,
            precioVenta: p.precioVenta,
            stockActual: p.inventario.stockActual
          }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar productos', err);
        this.mensaje = 'Error al conectar con el servidor.';
        this.cargando = false;
      }
    });
  }

  get total(): number {
    return this.carrito.reduce(
      (suma, item) => suma + item.producto.precioVenta * item.cantidad, 0
    );
  }

  get cambio(): number {
    return Math.max(0, this.montoRecibido - this.total);
  }

  agregarProducto(): void {
    this.mensaje = '';

    const producto = this.productos.find(
      p => p.idProducto === Number(this.productoId)
    );

    if (!producto) {
      this.mensaje = 'Selecciona un producto.';
      return;
    }

    const cantidad = Number(this.cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      this.mensaje = 'Ingresa una cantidad válida.';
      return;
    }

    const existente = this.carrito.find(
      item => item.producto.idProducto === producto.idProducto
    );

    const acumulado = (existente?.cantidad ?? 0) + cantidad;

    if (acumulado > producto.stockActual) {
      this.mensaje = `La cantidad supera el stock disponible (${producto.stockActual}).`;
      return;
    }

    if (existente) {
      existente.cantidad = acumulado;
    } else {
      this.carrito.push({ producto, cantidad });
    }

    this.productoId = 0;
    this.cantidad = 1;
  }

  quitarProducto(id: number): void {
    this.carrito = this.carrito.filter(item => item.producto.idProducto !== id);
  }

  registrarVenta(): void {
    this.mensaje = '';

    if (!this.cliente.trim()) {
      this.mensaje = 'Ingresa el nombre del cliente.';
      return;
    }

    if (this.carrito.length === 0) {
      this.mensaje = 'Agrega al menos un producto.';
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < this.total) {
      this.mensaje = 'El efectivo recibido es insuficiente.';
      return;
    }

    if (this.metodoPago === 'QR') {
      // Aquí podrías integrar pasarela de pagos, por ahora simulamos que se valida
      this.mensaje = 'Pago QR validado. Registrando venta...';
    }

    this.procesandoVenta = true;

    // Armamos el JSON para el backend
    const ventaPayload = {
      nombreCliente: this.cliente,
      metodoPago: this.metodoPago,
      total: this.total,
      detalles: this.carrito.map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioVenta
      }))
    };

    // Enviamos al backend (Asegúrate de tener este endpoint en Java)
    this.http.post(`${this.apiUrl}/ventas`, ventaPayload).subscribe({
      next: () => {
        this.mensaje = '¡Venta registrada exitosamente!';
        this.procesandoVenta = false;
        this.carrito = [];
        this.cliente = '';
        this.montoRecibido = 0;
        this.cargarProductos(); // Recargamos para actualizar el stock
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar venta', err);
        this.mensaje = err.error?.message || 'Error al registrar la venta. Revisa la consola.';
        this.procesandoVenta = false;
      }
    });
  }

  imprimirComprobante(): void {
    if (this.carrito.length === 0) {
      this.mensaje = 'Agrega productos antes de imprimir.';
      return;
    }
    window.print();
  }
}
