
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductoCompra {
  nombre: string;
  cantidad: number;
  costo: number;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css'
})
export class Compras {
  proveedor = '';
  producto = '';
  cantidad = 1;
  costo = 0;

  productos: ProductoCompra[] = [];
  mensaje = '';

  get total(): number {
    return this.productos.reduce(
      (suma, p) => suma + p.cantidad * p.costo,
      0
    );
  }

  agregarProducto(): void {
    const nombre = this.producto.trim();
    const cantidad = Number(this.cantidad);
    const costo = Number(this.costo);

    if (!nombre) {
      this.mensaje = 'Ingresa el nombre del producto.';
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      this.mensaje = 'Ingresa una cantidad válida.';
      return;
    }

    if (!Number.isFinite(costo) || costo <= 0) {
      this.mensaje = 'Ingresa un costo válido.';
      return;
    }

    this.productos.push({
      nombre,
      cantidad,
      costo
    });

    this.producto = '';
    this.cantidad = 1;
    this.costo = 0;
    this.mensaje = '';
  }

  quitarProducto(indice: number): void {
    this.productos.splice(indice, 1);
  }

  registrarCompra(): void {
    if (!this.proveedor.trim()) {
      this.mensaje = 'Ingresa el proveedor.';
      return;
    }

    if (this.productos.length === 0) {
      this.mensaje = 'Agrega al menos un producto.';
      return;
    }

    this.mensaje =
      'Compra de ejemplo validada. Falta conectar el registro al backend.';
  }
}
