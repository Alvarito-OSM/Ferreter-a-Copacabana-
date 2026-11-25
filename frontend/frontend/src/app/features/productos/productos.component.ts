import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioService } from '../../core/services/inventario.service';
import { Categoria } from '../../core/models/categoria';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  inventarios: any[] = [];
  categorias: Categoria[] = [];
  formProducto: FormGroup;
  
  esEdicion = false;
  idEdicion?: number;
  mostrarFormulario = false;
  
  busqueda = '';
  filtroCategoria = '';
  filtroEstado = '';
  mensajeExito = '';

  paginaActual: number = 1;
  itemsPorPagina: number = 30;
  imagenZoom: string | null = null;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private inventarioService: InventarioService,
    private fb: FormBuilder,
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
    this.cargarDatos();
    this.cargarCategorias();
  }

  cargarDatos(): void {
    forkJoin({
      productos: this.productoService.obtenerProductos(),
      inventarios: this.inventarioService.listarInventario()
    }).subscribe({
      next: (data) => {
        this.inventarios = data.inventarios;
        this.productos = data.productos.map(prod => {
          const inv = data.inventarios.find(i => i.producto?.idProducto === prod.idProducto);
          return { ...prod, inventario: inv || null };
        });
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar datos', err)
    });
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data: Categoria[]) => this.categorias = data,
      error: (err: any) => console.error('Error al cargar categorías', err)
    });
  }

  obtenerStock(prod: any): number {
    return prod.inventario?.stockActual || 0;
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
      const stockA = this.obtenerStock(a);
      const stockB = this.obtenerStock(b);
      const prioridadA = stockA === 0 ? 0 : (stockA <= 5 ? 1 : 2);
      const prioridadB = stockB === 0 ? 0 : (stockB <= 5 ? 1 : 2);
      if (prioridadA !== prioridadB) return prioridadA - prioridadB;
      return stockA - stockB; 
    });
  }

  get productosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.productosOrdenados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosOrdenados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  buscar(): void {
    this.paginaActual = 1;
  }

  abrirZoom(url: string): void {
    if (url) this.imagenZoom = url;
  }

  cerrarZoom(): void {
    this.imagenZoom = null;
  }

  abrirFormulario(producto?: any): void {
    this.mostrarFormulario = true;
    if (producto) {
      this.esEdicion = true;
      this.idEdicion = producto.idProducto;
      this.formProducto.patchValue({
        nombre: producto.nombre, 
        codigoBarras: producto.codigoBarras, 
        descripcion: producto.descripcion,
        imagenUrl: producto.imagenUrl, 
        precioCompra: producto.precioCompra, 
        precioVenta: producto.precioVenta,
        unidadMedida: producto.unidadMedida, 
        idCategoria: producto.categoria?.idCategoria,
        stockActual: this.obtenerStock(producto), 
        estado: producto.estado
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
    const stockIngresado = parseInt(v.stockActual, 10) || 0;

    // Obtenemos el ID del administrador logueado (si usas AuthService)
    // Si no lo tienes, puedes dejarlo en 1
    const idAdminLogueado = 1; 

    const datos: any = {
      nombre: v.nombre, codigoBarras: v.codigoBarras, descripcion: v.descripcion,
      imagenUrl: v.imagenUrl, precioCompra: Number(v.precioCompra), precioVenta: Number(v.precioVenta),
      unidadMedida: v.unidadMedida, estado: v.estado,
      categoria: { idCategoria: Number(v.idCategoria) }, 
      administrador: { idAdministrador: idAdminLogueado }
    };

    if (this.esEdicion && this.idEdicion) {
      datos.idProducto = this.idEdicion; 
      
      this.productoService.actualizarProducto(this.idEdicion, datos).subscribe({
        next: () => {
          const inv = this.inventarios.find(i => i.producto?.idProducto === this.idEdicion);
          
          if (inv) {
            // 👇 CORRECCIÓN: Agregamos fechaActualizacion 👇
            const invDataLimpia = {
              idInventario: inv.idInventario,
              producto: { idProducto: Number(this.idEdicion) }, 
              administrador: { idAdministrador: idAdminLogueado },
              stockActual: stockIngresado,
              stockMinimo: inv.stockMinimo || 5,
              ubicacion: inv.ubicacion || 'Bodega principal',
              fechaActualizacion: new Date().toISOString()
            };
            
            this.inventarioService.actualizarInventario(inv.idInventario, invDataLimpia).subscribe({
              next: () => this.finalizarGuardado('Producto y stock actualizados'),
              error: (err: any) => {
                console.error('ERROR AL ACTUALIZAR INVENTARIO:', err.error);
                alert('Error al actualizar el stock. Revisa F12 -> Network.');
              }
            });
          } else {
            // 👇 CORRECCIÓN: Agregamos fechaActualizacion 👇
            this.inventarioService.crearInventario({
              producto: { idProducto: Number(this.idEdicion) }, 
              administrador: { idAdministrador: idAdminLogueado },
              stockActual: stockIngresado, 
              stockMinimo: 5, 
              ubicacion: 'Bodega principal',
              fechaActualizacion: new Date().toISOString()
            }).subscribe({
              next: () => this.finalizarGuardado('Producto y stock actualizados'),
              error: (err: any) => {
                console.error('ERROR AL CREAR INVENTARIO FALTANTE:', err.error);
                alert('Error al crear el stock. Revisa F12.');
              }
            });
          }
        },
        error: (err: any) => alert('Error al editar producto: ' + (err.error?.message || 'Revisa consola'))
      });
    } else {
      this.productoService.crearProducto(datos).subscribe({
        next: (prodCreado: any) => {
          // 👇 CORRECCIÓN: Agregamos fechaActualizacion 👇
          const inventarioPayload = {
            producto: { idProducto: Number(prodCreado.idProducto) }, 
            administrador: { idAdministrador: idAdminLogueado },
            stockActual: stockIngresado, 
            stockMinimo: 5, 
            ubicacion: 'Bodega principal',
            fechaActualizacion: new Date().toISOString()
          };
          
          this.inventarioService.crearInventario(inventarioPayload).subscribe({
            next: () => this.finalizarGuardado('Producto creado con stock'),
            error: (err: any) => {
              console.error('ERROR AL CREAR INVENTARIO:', err.error);
              alert('Java rechazó el stock. Abre F12 -> Consola para ver el error detallado.');
              this.finalizarGuardado('Producto creado, pero falló el stock');
            }
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
          this.cargarDatos();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err: any) => alert('Error al eliminar: ' + (err.error?.message || 'Error del servidor'))
      });
    }
  }

  finalizarGuardado(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.cerrarFormulario(); 
    this.cargarDatos(); 
    setTimeout(() => this.mensajeExito = '', 3000);
  }
}
