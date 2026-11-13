import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html', // Asegúrate de que coincida con tu nombre de archivo
  styleUrls: ['./pos.css']   // Asegúrate de que coincida con tu nombre de archivo
})
export class PosComponent implements OnInit {
  
  productos: any[] = [];
  busqueda: string = '';
  carrito: any[] = [];
  
  idCliente: number = 4; 
  metodoPago: string = 'EFECTIVO';
  montoRecibido: number = 0;
  
  subtotal: number = 0;
  total: number = 0;
  cambio: number = 0;

  apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error cargando productos', err)
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
    if (item) {
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
    this.subtotal = this.carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
    this.total = this.subtotal; // El total es igual al subtotal, sin IVA
    this.calcularCambio();
  }

  calcularCambio() {
    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido > 0) {
      this.cambio = this.montoRecibido - this.total;
    } else {
      this.cambio = 0;
    }
  }

  finalizarVenta() {
    if (this.carrito.length === 0) return alert('El carrito está vacío');

    const idEmpleado = 2; 

    const ventaData = {
      idCliente: this.idCliente,
      idEmpleado: idEmpleado,
      metodoPago: this.metodoPago,
      montoRecibido: this.montoRecibido,
      detalles: this.carrito.map(c => ({
        idProducto: c.idProducto,
        cantidad: c.cantidad
      }))
    };

    this.http.post(`${this.apiUrl}/ventas`, ventaData).subscribe({
      next: (res: any) => {
        alert(`¡Venta registrada con éxito! Total: Bs. ${res.total} \nCambio: Bs. ${this.cambio}`);
        this.limpiarFormulario();
      },
      error: (err) => {
        alert('Error al procesar la venta: ' + (err.error || 'Verifique el stock'));
      }
    });
  }

  limpiarFormulario() {
    this.carrito = [];
    this.subtotal = 0;
    this.total = 0;
    this.montoRecibido = 0;
    this.cambio = 0;
    this.cargarProductos(); 
  }
}
