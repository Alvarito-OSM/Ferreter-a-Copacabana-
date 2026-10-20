import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioService } from '../../core/services/inventario.service';
import { Producto } from '../../core/models/producto';
import { Categoria } from '../../core/models/categoria';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  inventarios: any[] = []; 
  formProducto: FormGroup;
  esEdicion = false;
  idEdicion?: number;
  mostrarFormulario = false;
  busqueda = '';
  mensajeExito = '';

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
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: ['UNIDAD', Validators.required],
      idCategoria: ['', Validators.required],
      stockActual: [0, [Validators.required, Validators.min(0)]]
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

  buscar(): void {
    if (!this.busqueda.trim()) {
      this.cargarProductos();
      return;
    }
    this.productoService.buscarPorNombre(this.busqueda).subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err)
    });
  }

  abrirFormulario(producto?: Producto): void {
    this.mostrarFormulario = true;
    if (producto) {
      this.esEdicion = true;
      this.idEdicion = producto.idProducto;
      
      const stock = this.obtenerStock(producto.idProducto);

      this.formProducto.patchValue({
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarras,
        descripcion: producto.descripcion,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        unidadMedida: producto.unidadMedida,
        idCategoria: producto.categoria?.idCategoria,
        stockActual: stock 
      });
    } else {
      this.esEdicion = false;
      this.idEdicion = undefined;
      this.formProducto.reset({ unidadMedida: 'UNIDAD', precioCompra: 0, precioVenta: 0, stockActual: 0 });
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
      case 1: prefijo = 'HERR'; break;
      case 2: prefijo = 'HELE'; break;
      case 3: prefijo = 'CONS'; break;
      case 4: prefijo = 'TORN'; break;
      case 5: prefijo = 'PINT'; break;
      case 6: prefijo = 'PLOM'; break;
      case 7: prefijo = 'ELEC'; break;
      case 8: prefijo = 'JARD'; break;
      case 9: prefijo = 'SEGI'; break;
      case 10: prefijo = 'ADHE'; break;
      case 11: prefijo = 'ACCE'; break;
      case 12: prefijo = 'FERR'; break;
    }

    const productosCategoria = this.productos.filter(p => Number(p.categoria?.idCategoria) === Number(idCat));

    let maxNumero = 0;
    productosCategoria.forEach(prod => {
      const partes = prod.codigoBarras.split('-');
      if (partes.length === 2) {
        const numeroActual = parseInt(partes[1], 10);
        if (!isNaN(numeroActual) && numeroActual > maxNumero) {
          maxNumero = numeroActual;
        }
      }
    });

    const nuevoNumero = (maxNumero + 1).toString().padStart(3, '0');
    const nuevoCodigo = `${prefijo}-${nuevoNumero}`;

    this.formProducto.patchValue({ codigoBarras: nuevoCodigo });
  }

  guardar(): void {
    if (this.formProducto.invalid) return;

    const valores = this.formProducto.value;

    const datos: any = {
      nombre: valores.nombre,
      codigoBarras: valores.codigoBarras,
      descripcion: valores.descripcion,
      precioCompra: valores.precioCompra,
      precioVenta: valores.precioVenta,
      unidadMedida: valores.unidadMedida,
      estado: true,
      categoria: { 
        idCategoria: Number(valores.idCategoria) 
      },
      administrador: { 
        idAdministrador: 1 
      }
    };

    if (this.esEdicion && this.idEdicion) {
      datos.idProducto = this.idEdicion; 
      
      this.productoService.actualizarProducto(this.idEdicion, datos).subscribe({
        next: () => {
          const inventarioExistente = this.inventarios.find(i => i.producto?.idProducto === this.idEdicion);
          
          if (inventarioExistente) {
            const datosInventario = {
              ...inventarioExistente,
              stockActual: valores.stockActual
            };
            
            this.inventarioService.actualizarInventario(inventarioExistente.idInventario, datosInventario).subscribe({
              next: () => this.finalizarGuardado('Producto y stock actualizados correctamente'),
              error: (err: any) => {
                console.error('Error al actualizar stock:', err);
                this.finalizarGuardado('Producto actualizado, pero falló el stock');
              }
            });
          } else {
            this.finalizarGuardado('Producto actualizado correctamente');
          }
        },
        error: (err: any) => {
          console.error('Error del servidor:', err);
          alert('Error al actualizar: ' + (err.error?.message || 'Revisa la consola'));
        }
      });
    } else {
      this.productoService.crearProducto(datos).subscribe({
        next: (productoCreado: any) => {
          
          const datosInventario = {
            producto: { idProducto: productoCreado.idProducto },
            administrador: { idAdministrador: 1 },
            stockActual: valores.stockActual,
            stockMinimo: 5,
            ubicacion: 'Bodega Principal'
          };

          this.inventarioService.crearInventario(datosInventario).subscribe({
            next: () => this.finalizarGuardado('Producto e inventario creados correctamente'),
            error: (err: any) => {
              console.error('Error al crear inventario:', err);
              this.finalizarGuardado('Producto creado, pero falló el inventario');
            }
          });
        },
        error: (err: any) => {
          console.error('Error del servidor:', err);
          if (err.status === 500 && err.error?.message?.includes('unique')) {
            alert('El código de barras ya existe. Por favor, ingresa uno diferente.');
          } else {
            alert('Error al crear producto: ' + (err.error?.message || 'Revisa la consola'));
          }
        }
      });
    }
  }

  finalizarGuardado(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.cerrarFormulario();
    this.cargarProductos();
    this.cargarInventarios(); 
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  eliminar(id?: number): void {
    if (id && confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.mensajeExito = 'Producto eliminado';
          this.cargarProductos();
          this.cargarInventarios();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err: any) => alert('Error al eliminar: ' + (err.error?.message || 'Error del servidor'))
      });
    }
  }

  obtenerNombreCategoria(idCat: number | undefined): string {
    if (!idCat) return 'Sin categoría';
    const cat = this.categorias.find(c => c.idCategoria === idCat);
    return cat ? cat.nombre : 'Sin categoría';
  }

  obtenerColorCategoria(idCat: number | undefined): string {
    if (!idCat) return '#94a3b8';
    const colores = [
      '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#eab308', '#ec4899', '#6366f1', '#14b8a6', 
      '#f97316', '#64748b'
    ];
    const indice = (idCat - 1) % colores.length;
    return colores[indice >= 0 ? indice : 0];
  }
}
