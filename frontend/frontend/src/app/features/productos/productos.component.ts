import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioService } from '../../core/services/inventario.service';
import { Producto } from '../../core/models/producto';
import { AuthService } from '../../core/services/auth.service';
import { Categoria } from '../../core/models/categoria';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  readonly esAdmin = inject(AuthService).isAdministrador();
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  inventarios: any[] = []; 
  formProducto: FormGroup;
  esEdicion = false;
  idEdicion?: number;
  mostrarFormulario = false;
  
  busqueda = '';
  filtroCategoria = '';
  filtroEstado = '';

  mensajeExito = '';
  apiUrl = 'http://localhost:8080/api';

  mostrarModalStock: boolean = false;
  productoSeleccionado: number | null = null;
  cantidadIngreso: number = 0;
  procesando: boolean = false;

  mostrarModalImagen: boolean = false;
  productoImagenSeleccionado: any = null;

  pestanaActiva: string = 'eoq'; 
  eoqDatos = { demandaAnual: 12000, costoPedido: 50, costoMantenimiento: 2.5, tiempoEntregaDias: 10, desviacionEstandar: 15, nivelServicio: 1.65 };
  eoqResultados: any = null;
  demandaHistorica: number[] = [150, 160, 155, 170, 180, 175, 190];
  pronosticoResultados: any = null;
  linealDatos = { h1: 10, h2: 15, h3: 20, horasDisponibles: 100, maderaDisponible: 200, maderaH1: 2, maderaH2: 3, maderaH3: 4 };
  linealResultados: any = null;
  colasDatos = { tasaLLegada: 5, tasaServicio: 6 };
  colasResultados: any = null;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private inventarioService: InventarioService,
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.formProducto = this.fb.group({
      nombre: ['', Validators.required],
      codigoBarras: ['', Validators.required],
      descripcion: [''],
      imagenUrl: [''],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: ['UNIDAD', Validators.required],
      idCategoria: ['', Validators.required],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarInventarios(); 
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.error('Error al cargar productos', err)
    });
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar categorías', err)
    });
  }

  cargarInventarios(): void {
    this.inventarioService.listarInventario().subscribe({
      next: (data: any[]) => {
        this.inventarios = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar inventario', err)
    });
  }

  obtenerStock(idProducto: number | undefined): number {
    if (!idProducto) return 0;
    const inv = this.inventarios.find(i => i.producto?.idProducto === idProducto);
    return inv ? inv.stockActual : 0;
  }

  get productosOrdenados() {
    let filtrados = this.productos.filter(p => {
      const term = this.busqueda.toLowerCase().trim();
      const matchBusqueda = p.nombre.toLowerCase().includes(term) || (p.codigoBarras && p.codigoBarras.includes(term));
      const matchCategoria = this.filtroCategoria ? p.categoria?.nombre === this.filtroCategoria : true;
      const matchEstado = this.filtroEstado ? (this.filtroEstado === 'activo' ? p.estado === true : p.estado === false) : true;

      return matchBusqueda && matchCategoria && matchEstado;
    });

    return filtrados.sort((a, b) => {
      const stockA = this.obtenerStock(a.idProducto);
      const stockB = this.obtenerStock(b.idProducto);

      const prioridadA = stockA === 0 ? 0 : (stockA <= 5 ? 1 : 2);
      const prioridadB = stockB === 0 ? 0 : (stockB <= 5 ? 1 : 2);

      if (prioridadA !== prioridadB) return prioridadA - prioridadB;
      return stockA - stockB; 
    });
  }

  get totalItems(): number { return this.productos.length; }
  get valorInventario(): number {
    return this.productos.reduce((acc, p) => acc + (this.obtenerStock(p.idProducto) * (p.precioCompra || 0)), 0);
  }
  get lowStockItems(): number {
    return this.productos.filter(p => { const s = this.obtenerStock(p.idProducto); return s > 0 && s <= 5; }).length;
  }
  get outOfStockItems(): number {
    return this.productos.filter(p => this.obtenerStock(p.idProducto) === 0).length;
  }

  // 👇 ESTA ES LA FUNCIÓN QUE FALTABA 👇
  buscar(): void {
    this.busqueda = this.busqueda.trim();
  }

  abrirModalImagen(prod: any): void {
    if (!prod.imagenUrl) return;
    this.productoImagenSeleccionado = prod;
    this.mostrarModalImagen = true;
  }
  cerrarModalImagen(): void {
    this.mostrarModalImagen = false;
    this.productoImagenSeleccionado = null;
  }

  abrirFormulario(producto?: Producto): void {
    this.mostrarFormulario = true;
    if (producto) {
      this.esEdicion = true;
      this.idEdicion = producto.idProducto;
      const stock = this.obtenerStock(producto.idProducto);
      this.formProducto.patchValue({
        nombre: producto.nombre, codigoBarras: producto.codigoBarras, descripcion: producto.descripcion,
        imagenUrl: producto.imagenUrl, precioCompra: producto.precioCompra, precioVenta: producto.precioVenta,
        unidadMedida: producto.unidadMedida, idCategoria: producto.categoria?.idCategoria,
        stockActual: stock, estado: producto.estado
      });
    } else {
      this.esEdicion = false;
      this.idEdicion = undefined;
      this.formProducto.reset({ unidadMedida: 'UNIDAD', precioCompra: 0, precioVenta: 0, stockActual: 0, estado: true });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formProducto.reset();
  }

  generarCodigoBarras() {
    const idCat = this.formProducto.get('idCategoria')?.value;
    if (!idCat) return;
    let prefijo = 'GEN';
    switch (Number(idCat)) {
      case 1: prefijo = 'HERR'; break; case 2: prefijo = 'HELE'; break; case 3: prefijo = 'CONS'; break;
      case 4: prefijo = 'TORN'; break; case 5: prefijo = 'PINT'; break; case 6: prefijo = 'PLOM'; break;
      case 7: prefijo = 'ELEC'; break; case 8: prefijo = 'JARD'; break; case 9: prefijo = 'SEGI'; break;
      case 10: prefijo = 'ADHE'; break; case 11: prefijo = 'ACCE'; break; case 12: prefijo = 'FERR'; break;
    }
    const prodsCat = this.productos.filter(p => Number(p.categoria?.idCategoria) === Number(idCat));
    let maxNum = 0;
    prodsCat.forEach(prod => {
      const partes = prod.codigoBarras.split('-');
      if (partes.length === 2) {
        const num = parseInt(partes[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    this.formProducto.patchValue({ codigoBarras: `${prefijo}-${(maxNum + 1).toString().padStart(3, '0')}` });
  }

  guardar(): void {
    if (this.formProducto.invalid) return;
    const v = this.formProducto.value;
    const datos: any = {
      nombre: v.nombre, codigoBarras: v.codigoBarras, descripcion: v.descripcion,
      imagenUrl: v.imagenUrl, precioCompra: v.precioCompra, precioVenta: v.precioVenta,
      unidadMedida: v.unidadMedida, estado: v.estado,
      categoria: { idCategoria: Number(v.idCategoria) }, administrador: { idAdministrador: 1 }
    };

    if (this.esEdicion && this.idEdicion) {
      datos.idProducto = this.idEdicion; 
      this.productoService.actualizarProducto(this.idEdicion, datos).subscribe({
        next: () => {
          const inv = this.inventarios.find(i => i.producto?.idProducto === this.idEdicion);
          if (inv) {
            this.inventarioService.actualizarInventario(inv.idInventario, { ...inv, stockActual: v.stockActual }).subscribe({
              next: () => this.finalizarGuardado('Producto y stock actualizados'),
              error: () => this.finalizarGuardado('Producto actualizado, falló el stock')
            });
          } else { this.finalizarGuardado('Producto actualizado'); }
        },
        error: (err: any) => alert('Error: ' + (err.error?.message || 'Revisa consola'))
      });
    } else {
      this.productoService.crearProducto(datos).subscribe({
        next: (prodCreado: any) => {
          this.inventarioService.crearInventario({
            producto: { idProducto: prodCreado.idProducto }, administrador: { idAdministrador: 1 },
            stockActual: v.stockActual, stockMinimo: 5, ubicacion: 'Bodega'
          }).subscribe({
            next: () => this.finalizarGuardado('Producto creado'),
            error: () => this.finalizarGuardado('Producto creado, falló inventario')
          });
        },
        error: (err: any) => {
          if (err.status === 500) alert('El código de barras ya existe.');
          else alert('Error al crear: ' + (err.error?.message || 'Revisa consola'));
        }
      });
    }
  }

  eliminar(id?: number): void {
    if (id && confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.mensajeExito = 'Producto eliminado';
          this.cargarProductos(); this.cargarInventarios();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err: any) => alert('Error al eliminar: ' + (err.error?.message || 'Error del servidor'))
      });
    }
  }

  finalizarGuardado(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.cerrarFormulario(); this.cargarProductos(); this.cargarInventarios(); 
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  abrirModalStock() { this.mostrarModalStock = true; this.productoSeleccionado = null; this.cantidadIngreso = 0; }
  cerrarModalStock() { this.mostrarModalStock = false; }

  guardarStock() {
    if (!this.productoSeleccionado || this.cantidadIngreso <= 0) return;
    this.procesando = true;
    this.http.post(`${this.apiUrl}/inventario/ajustes`, {
      idProducto: this.productoSeleccionado, cantidad: this.cantidadIngreso,
      tipoMovimiento: 'ENTRADA', motivo: 'Ingreso de mercadería'
    }).subscribe({
      next: () => {
        alert('Stock ingresado correctamente'); this.procesando = false;
        this.cerrarModalStock(); this.cargarInventarios();
      },
      error: (err) => { alert('Error al guardar. Revisa la consola.'); this.procesando = false; }
    });
  }

  calcularEOQ() {
    const { demandaAnual, costoPedido, costoMantenimiento, tiempoEntregaDias, desviacionEstandar, nivelServicio } = this.eoqDatos;
    const q = Math.sqrt((2 * demandaAnual * costoPedido) / costoMantenimiento);
    const ss = nivelServicio * desviacionEstandar * Math.sqrt(tiempoEntregaDias);
    const pr = (demandaAnual / 365 * tiempoEntregaDias) + ss;
    this.eoqResultados = { qOptimo: q.toFixed(2), puntoReorden: pr.toFixed(2), stockSeguridad: ss.toFixed(2), costoTotal: ((demandaAnual / q) * costoPedido + (q / 2) * costoMantenimiento).toFixed(2) };
  }

  calcularPronostico() {
    const n = 3; const ultimos = this.demandaHistorica.slice(-n);
    this.pronosticoResultados = { pronosticoProximoMes: (ultimos.reduce((a, b) => a + b, 0) / n).toFixed(0) };
  }

  calcularLineal() {
    const { h1, h2, h3, maderaDisponible, maderaH1, maderaH2, maderaH3 } = this.linealDatos;
    const prods = [
      { nombre: 'P1', rent: h1 / maderaH1, madera: maderaH1, ganancia: h1 },
      { nombre: 'P2', rent: h2 / maderaH2, madera: maderaH2, ganancia: h2 },
      { nombre: 'P3', rent: h3 / maderaH3, madera: maderaH3, ganancia: h3 }
    ].sort((a, b) => b.rent - a.rent);
    
    let restante = maderaDisponible; let total = 0; const prod: any = {};
    for (let p of prods) {
      const cant = Math.floor(restante / p.madera);
      prod[p.nombre] = cant; total += cant * p.ganancia; restante -= cant * p.madera;
    }
    this.linealResultados = { produccion: prod, gananciaTotal: total.toFixed(2), maderaSobrante: restante };
  }

  calcularColas() {
    const { tasaLLegada, tasaServicio } = this.colasDatos;
    if (tasaLLegada >= tasaServicio) { alert('La tasa de llegada debe ser menor a la de servicio.'); return; }
    const rho = tasaLLegada / tasaServicio;
    const lq = (tasaLLegada ** 2) / (tasaServicio * (tasaServicio - tasaLLegada));
    const wq = tasaLLegada / (tasaServicio * (tasaServicio - tasaLLegada));
    const ws = 1 / (tasaServicio - tasaLLegada);
    this.colasResultados = {
      utilizacion: (rho * 100).toFixed(2) + '%',
      longitudCola: lq.toFixed(2),
      tiempoCola: (wq * 60).toFixed(2) + ' min',
      tiempoSistema: (ws * 60).toFixed(2) + ' min'
    };
  }
}
