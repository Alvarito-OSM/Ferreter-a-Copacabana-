import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProductoService } from '../../../core/services/producto.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { VentaService } from '../../../core/services/venta.service';
import { Producto } from '../../../core/models/producto';
import { Empleado } from '../../../core/models/empleado';
import { Venta } from '../../../core/models/venta';

interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.css']
})
export class PuntoVentaComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly productoService = inject(ProductoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly clienteService = inject(ClienteService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly ventaService = inject(VentaService);

  private readonly tasaIva = 0.13;

  readonly productos = signal<Producto[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly ventasHoy = signal<Venta[]>([]);
  readonly stock = signal<Record<number, number>>({});
  readonly carrito = signal<LineaCarrito[]>([]);
  readonly busqueda = signal('');
  readonly idCliente = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly mensaje = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  private empleado: Empleado | undefined;

  readonly usuario = this.auth.getUsuario() ?? '';

  readonly productosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    return this.productos().filter(p =>
      p.estado && (!termino || p.nombre.toLowerCase().includes(termino) || p.codigoBarras.includes(termino))
    );
  });

  readonly subtotal = computed(() =>
    this.carrito().reduce((suma, l) => suma + l.producto.precioVenta * l.cantidad, 0)
  );
  readonly iva = computed(() => this.subtotal() * this.tasaIva);
  readonly total = computed(() => this.subtotal() + this.iva());
  readonly unidades = computed(() => this.carrito().reduce((suma, l) => suma + l.cantidad, 0));
  readonly totalVendidoHoy = computed(() => this.ventasHoy().reduce((suma, v) => suma + v.total, 0));

  ngOnInit(): void {
    this.cargarDatos();
  }

  disponible(producto: Producto): number {
    const enCarrito = this.carrito().find(l => l.producto.idProducto === producto.idProducto)?.cantidad ?? 0;
    return (this.stock()[producto.idProducto!] ?? 0) - enCarrito;
  }

  agregar(producto: Producto): void {
    if (this.disponible(producto) <= 0) {
      this.avisar('error', `No hay más stock de ${producto.nombre}`);
      return;
    }
    this.carrito.update(lineas => {
      const existente = lineas.find(l => l.producto.idProducto === producto.idProducto);
      return existente
        ? lineas.map(l => (l === existente ? { ...l, cantidad: l.cantidad + 1 } : l))
        : [...lineas, { producto, cantidad: 1 }];
    });
    this.mensaje.set(null);
  }

  quitar(linea: LineaCarrito): void {
    this.carrito.update(lineas =>
      linea.cantidad > 1
        ? lineas.map(l => (l === linea ? { ...l, cantidad: l.cantidad - 1 } : l))
        : lineas.filter(l => l !== linea)
    );
  }

  eliminar(linea: LineaCarrito): void {
    this.carrito.update(lineas => lineas.filter(l => l !== linea));
  }

  vaciar(): void {
    this.carrito.set([]);
  }

  puedeCobrar(): boolean {
    return this.carrito().length > 0 && this.idCliente() !== null && !this.procesando();
  }

  cobrar(): void {
    if (!this.puedeCobrar()) {
      return;
    }
    if (!this.empleado?.idEmpleado) {
      this.avisar('error', 'No se encontró un empleado asociado a tu usuario');
      return;
    }

    this.procesando.set(true);
    this.ventaService.registrar({
      idCliente: this.idCliente()!,
      idEmpleado: this.empleado.idEmpleado,
      detalles: this.carrito().map(l => ({ idProducto: l.producto.idProducto!, cantidad: l.cantidad }))
    }).subscribe({
      next: venta => {
        this.procesando.set(false);
        this.carrito.set([]);
        this.idCliente.set(null);
        this.avisar('ok', `Venta #${venta.idVenta} registrada por Bs ${venta.total.toFixed(2)}`);
        this.cargarDatos();
      },
      error: err => {
        this.procesando.set(false);
        this.avisar('error', err.error?.message ?? 'No se pudo registrar la venta');
      }
    });
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({
      productos: this.productoService.obtenerProductos(),
      inventario: this.inventarioService.listarInventario(),
      clientes: this.clienteService.listar(),
      empleados: this.empleadoService.obtenerEmpleados().pipe(catchError(() => of([] as Empleado[]))),
      ventas: this.ventaService.listar().pipe(catchError(() => of([] as Venta[])))
    }).subscribe({
      next: ({ productos, inventario, clientes, empleados, ventas }) => {
        this.productos.set(productos);
        this.stock.set(Object.fromEntries(inventario.map(i => [i.producto.idProducto, i.stockActual])));
        this.clientes.set(clientes.filter(c => c.estado !== false));
        this.empleado = empleados.find(e => e.usuario === this.usuario);
        this.ventasHoy.set(ventas.filter(v => this.esDeHoy(v.fecha) && v.idEmpleado === this.empleado?.idEmpleado));
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.avisar('error', 'No se pudieron cargar los datos del punto de venta');
      }
    });
  }

  private esDeHoy(fecha: string): boolean {
    return new Date(fecha).toDateString() === new Date().toDateString();
  }

  private avisar(tipo: 'ok' | 'error', texto: string): void {
    this.mensaje.set({ tipo, texto });
  }
}
