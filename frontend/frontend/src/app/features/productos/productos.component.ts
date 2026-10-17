
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Producto,
  ProductoService
} from '../../core/services/producto.service';
import {
  Categoria,
  CategoriaService
} from '../../core/services/categoria.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .productos-container {
      padding: 24px;
    }

    .acciones {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .precio {
      font-weight: 600;
    }
  `],
  template: `
    <section class="productos-container">

      <h2 class="mb-4">Gestión de Productos</h2>

      <div *ngIf="mensaje"
           class="alert alert-danger">
        {{ mensaje }}
      </div>

      <div class="card mb-4">
        <div class="card-header">
          Consultar productos
        </div>

        <div class="card-body">
          <div class="row g-3">

            <div class="col-md-6">
              <label class="form-label">
                Buscar por nombre o código
              </label>

              <input
                class="form-control"
                name="busqueda"
                placeholder="Buscar producto..."
                [(ngModel)]="busqueda"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label">
                Categoría
              </label>

              <select
                class="form-select"
                name="categoria"
                [(ngModel)]="categoriaSeleccionada">

                <option [ngValue]="0">
                  Todas las categorías
                </option>

                <option
                  *ngFor="let c of categorias"
                  [ngValue]="c.idCategoria">
                  {{ c.nombre }}
                </option>

              </select>
            </div>

          </div>

          <button
            class="btn btn-outline-primary mt-3"
            (click)="cargar()">
            Actualizar listado
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          Lista de Productos
        </div>

        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Compra</th>
                  <th>Venta</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>

                <tr *ngFor="let p of productosFiltrados">
                  <td>{{ p.idProducto }}</td>
                  <td>{{ p.codigoBarras }}</td>
                  <td>{{ p.nombre }}</td>
                  <td>{{ p.categoria?.nombre || p.categoria?.idCategoria }}</td>
                  <td>{{ p.unidadMedida }}</td>
                  <td class="precio">
                    Bs {{ p.precioCompra | number:'1.2-2' }}
                  </td>
                  <td class="precio">
                    Bs {{ p.precioVenta | number:'1.2-2' }}
                  </td>
                  <td>
                    <span
                      [class.text-success]="p.estado"
                      [class.text-danger]="!p.estado">
                      {{ p.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>

                <tr *ngIf="productosFiltrados.length === 0">
                  <td colspan="8" class="text-center py-4">
                    No hay productos para mostrar.
                  </td>
                </tr>

              </tbody>

            </table>
          </div>
        </div>
      </div>

    </section>
  `
})
export class ProductosComponent implements OnInit {

  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  productos: Producto[] = [];
  categorias: Categoria[] = [];

  busqueda = '';
  categoriaSeleccionada = 0;
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
    this.cargarCategorias();
  }

  cargar(): void {
    this.mensaje = '';

    this.productoService.listar().subscribe({
      next: datos => {
        this.productos = datos;
      },
      error: err => {
        console.error(err);
        this.mensaje = 'No se pudieron cargar los productos.';
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: datos => {
        this.categorias = datos;
      },
      error: err => {
        console.error(err);
        this.mensaje = 'No se pudieron cargar las categorías.';
      }
    });
  }

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(p => {
      const coincideTexto =
        p.nombre.toLowerCase().includes(texto) ||
        p.codigoBarras.toLowerCase().includes(texto);

      const coincideCategoria =
        this.categoriaSeleccionada === 0 ||
        p.categoria?.idCategoria ===
          this.categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });
  }
}
