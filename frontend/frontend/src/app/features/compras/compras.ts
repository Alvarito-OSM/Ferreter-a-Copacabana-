import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

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

  // Listas para los selects
  proveedores: any[] = [];
  productos: any[] = [];

  // Variables del formulario
  idProveedor: number | null = null;
  idProducto: number | null = null;
  cantidad: number = 1;
  costo: number = 0;
  
  // Lista de productos agregados a la compra
  detalles: DetalleCompra[] = [];
  mensaje: string = '';
  cargando: boolean = false;

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Traemos proveedores y productos al mismo tiempo
    forkJoin({
      proveedores: this.http.get<any[]>(`${this.apiUrl}/proveedores`),
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`)
    }).subscribe({
      next: (data) => {
        this.proveedores = data.proveedores.filter(p => p.estado); // Solo activos
        this.productos = data.productos.filter(p => p.estado);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  // 👇 Cuando selecciona un producto, autocompletamos el costo 👇
  onProductoChange() {
    if (this.idProducto) {
      const prod = this.productos.find(p => p.idProducto === Number(this.idProducto));
      if (prod) {
        this.costo = prod.precioCompra; // Usamos el precio de compra del producto
      }
    }
  }

  get total(): number {
    return this.detalles.reduce((suma, p) => suma + (p.cantidad * p.costo), 0);
  }

  agregarProducto(): void {
    this.mensaje = '';

    if (!this.idProducto) {
      this.mensaje = 'Selecciona un producto.';
      return;
    }
    if (this.cantidad <= 0 || this.costo <= 0) {
      this.mensaje = 'Ingresa una cantidad y costo válidos.';
      return;
    }

    const prodSeleccionado = this.productos.find(p => p.idProducto === Number(this.idProducto));
    if (!prodSeleccionado) return;

    // Verificamos si el producto ya está en la lista
    const existente = this.detalles.find(d => d.idProducto === prodSeleccionado.idProducto);

    if (existente) {
      existente.cantidad += Number(this.cantidad);
      existente.costo = Number(this.costo); // Actualizamos el costo al último
    } else {
      this.detalles.push({
        idProducto: prodSeleccionado.idProducto,
        nombre: prodSeleccionado.nombre,
        cantidad: Number(this.cantidad),
        costo: Number(this.costo)
      });
    }

    // Limpiamos los campos
    this.idProducto = null;
    this.cantidad = 1;
    this.costo = 0;
  }

  quitarProducto(indice: number): void {
    this.detalles.splice(indice, 1);
  }

  registrarCompra(): void {
    this.mensaje = '';
    
    if (!this.idProveedor) {
      this.mensaje = 'Selecciona un proveedor.';
      return;
    }
    if (this.detalles.length === 0) {
      this.mensaje = 'Agrega al menos un producto.';
      return;
    }

    this.cargando = true;

    // Armamos el JSON para el Backend
    const compraData = {
      idProveedor: Number(this.idProveedor),
      idEmpleado: 1, // 👈 ¡OJO! Si da error, pon el ID de un empleado real de tu BD
      total: this.total,
      detalles: this.detalles.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        costoUnitario: d.costo
      }))
    };

    this.http.post(`${this.apiUrl}/compras`, compraData).subscribe({
      next: (res: any) => {
        alert('¡Compra registrada exitosamente! El stock ha sido actualizado.');
        this.detalles = [];
        this.idProveedor = null;
        this.mensaje = '';
        this.cargando = false;
        this.cargarDatos(); // Recargamos los productos (por si cambió el stock)
      },
      error: (err) => {
        console.error('Error al registrar compra', err);
        this.mensaje = 'Error del servidor: ' + (err.error?.message || 'Revisa la consola o el stock del empleado.');
        this.cargando = false;
      }
    });
  }
}
