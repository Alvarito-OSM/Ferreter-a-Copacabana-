
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductoVenta {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
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
  styleUrl: './ventas.css'
})
export class Ventas {
  productos: ProductoVenta[] = [
    { id: 1, nombre: 'Martillo', precio: 45, stock: 20 },
    { id: 2, nombre: 'Destornillador', precio: 18, stock: 30 },
    { id: 3, nombre: 'Tornillos (paquete)', precio: 12, stock: 50 },
    { id: 4, nombre: 'Taladro', precio: 350, stock: 10 }
  ];

  carrito: ItemVenta[] = [];

  productoId = 0;
  cantidad = 1;
  cliente = '';
  metodoPago: 'EFECTIVO' | 'QR' = 'EFECTIVO';
  montoRecibido = 0;
  mensaje = '';

  get total(): number {
    return this.carrito.reduce(
      (suma, item) => suma + item.producto.precio * item.cantidad,
      0
    );
  }

  get cambio(): number {
    return Math.max(0, this.montoRecibido - this.total);
  }

  agregarProducto(): void {
    this.mensaje = '';

    const producto = this.productos.find(
      p => p.id === Number(this.productoId)
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
      item => item.producto.id === producto.id
    );

    const acumulado = (existente?.cantidad ?? 0) + cantidad;

    if (acumulado > producto.stock) {
      this.mensaje = 'La cantidad supera el stock disponible.';
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
    this.carrito = this.carrito.filter(
      item => item.producto.id !== id
    );
  }

  registrarVenta(): void {
    if (!this.cliente.trim()) {
      this.mensaje = 'Ingresa el nombre del cliente.';
      return;
    }

    if (this.carrito.length === 0) {
      this.mensaje = 'Agrega al menos un producto.';
      return;
    }

    if (
      this.metodoPago === 'EFECTIVO' &&
      this.montoRecibido < this.total
    ) {
      this.mensaje = 'El efectivo recibido es insuficiente.';
      return;
    }

    if (this.metodoPago === 'QR') {
      this.mensaje =
        'Pago QR pendiente: debe confirmarse antes de registrar la venta.';
      return;
    }

    this.mensaje =
      'Venta de ejemplo validada. Falta conectar el registro al backend.';
  }

  imprimirComprobante(): void {
    if (this.carrito.length === 0) {
      this.mensaje = 'Agrega productos antes de imprimir.';
      return;
    }

    window.print();
  }
}
