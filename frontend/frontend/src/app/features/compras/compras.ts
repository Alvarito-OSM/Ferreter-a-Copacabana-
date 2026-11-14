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
  exito: string = '';
  cargando: boolean = false;
  compras: any[] = [];

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    // Traemos proveedores y productos al mismo tiempo
    forkJoin({
      proveedores: this.http.get<any[]>(`${this.apiUrl}/proveedores`),
      productos: this.http.get<any[]>(`${this.apiUrl}/productos`),
      compras: this.http.get<any[]>(`${this.apiUrl}/compras`)
    }).subscribe({
      next: (data) => {
        this.proveedores = data.proveedores.filter(p => p.estado); // Solo activos
        this.productos = data.productos.filter(p => p.estado);
        this.compras = data.compras
          .filter(c => c.estado !== 'ANULADA')
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
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

  nombreProveedor(id: number): string {
    const prov = this.proveedores.find(p => p.idProveedor === id);
    return prov ? prov.razonSocial : 'Proveedor #' + id;
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
    this.exito = '';

    const idAdministrador = this.authService.getId();
    if (idAdministrador === null) {
      this.mensaje = 'Vuelve a iniciar sesión como administrador para registrar compras.';
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
        this.exito = 'Compra #' + res.idCompra + ' registrada por Bs. ' + res.total + '. El stock fue actualizado.';
        this.detalles = [];
        this.idProveedor = null;
        this.cargando = false;
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al registrar compra', err);
        this.mensaje = 'No se pudo registrar la compra: ' + (err.error?.message || err.error?.error || 'revisa los datos enviados.');
        this.cargando = false;
      }
    });
  }
}
