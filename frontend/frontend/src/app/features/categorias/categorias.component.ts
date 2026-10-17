
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Categoria,
  CategoriaService
} from '../../core/services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="container py-4">
      <h2 class="mb-4">Gestión de Categorías</h2>

      <div *ngIf="mensaje"
           class="alert"
           [class.alert-success]="!error"
           [class.alert-danger]="error">
        {{ mensaje }}
      </div>

      <div class="card mb-4">
        <div class="card-header">
          {{ editando ? 'Editar categoría' : 'Nueva categoría' }}
        </div>

        <div class="card-body">
          <form #formulario="ngForm" (ngSubmit)="guardar()">
            <div class="mb-3">
              <label class="form-label">Nombre</label>
              <input
                class="form-control"
                name="nombre"
                [(ngModel)]="categoria.nombre"
                maxlength="80"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea
                class="form-control"
                name="descripcion"
                [(ngModel)]="categoria.descripcion"
                maxlength="255"
              ></textarea>
            </div>

            <button
              class="btn btn-primary me-2"
              type="submit"
              [disabled]="formulario.invalid || guardando">
              {{ editando ? 'Actualizar' : 'Guardar' }}
            </button>

            <button
              class="btn btn-secondary"
              type="button"
              (click)="limpiar()">
              Cancelar
            </button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header">Lista de categorías</div>

        <div class="card-body">
          <input
            class="form-control mb-3"
            placeholder="Buscar categoría..."
            [(ngModel)]="busqueda"
          />

          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let c of categoriasFiltradas">
                  <td>{{ c.idCategoria }}</td>
                  <td>{{ c.nombre }}</td>
                  <td>{{ c.descripcion }}</td>
                  <td>
                    <button
                      class="btn btn-warning btn-sm me-2"
                      (click)="editar(c)">
                      Editar
                    </button>

                    <button
                      class="btn btn-danger btn-sm"
                      (click)="eliminar(c)">
                      Eliminar
                    </button>
                  </td>
                </tr>

                <tr *ngIf="categoriasFiltradas.length === 0">
                  <td colspan="4" class="text-center">
                    No hay categorías para mostrar.
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
export class CategoriasComponent implements OnInit {

  private service = inject(CategoriaService);

  categorias: Categoria[] = [];
  categoria: Categoria = this.nuevaCategoria();

  busqueda = '';
  mensaje = '';
  error = false;
  editando = false;
  guardando = false;

  ngOnInit(): void {
    this.cargar();
  }

  nuevaCategoria(): Categoria {
    return {
      nombre: '',
      descripcion: ''
    };
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: datos => this.categorias = datos,
      error: () => {
        this.error = true;
        this.mensaje = 'No se pudieron cargar las categorías.';
      }
    });
  }

  get categoriasFiltradas(): Categoria[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(texto)
    );
  }

  guardar(): void {
    if (!this.categoria.nombre.trim() || this.guardando) return;

    this.guardando = true;

    const operacion = this.editando &&
      this.categoria.idCategoria != null
        ? this.service.actualizar(
            this.categoria.idCategoria,
            this.categoria
          )
        : this.service.crear(this.categoria);

    operacion.subscribe({
      next: () => {
        this.guardando = false;
        this.error = false;
        this.mensaje = 'Categoría guardada correctamente.';
        this.limpiar(false);
        this.cargar();
      },
      error: err => {
        this.guardando = false;
        this.error = true;
        this.mensaje =
          err.error?.mensaje ||
          err.error?.detail ||
          'No se pudo guardar la categoría.';
      }
    });
  }

  editar(c: Categoria): void {
    this.categoria = { ...c };
    this.editando = true;
    this.mensaje = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(c: Categoria): void {
    if (c.idCategoria == null) return;

    if (!confirm(`¿Eliminar la categoría ${c.nombre}?`)) return;

    this.service.eliminar(c.idCategoria).subscribe({
      next: () => {
        this.error = false;
        this.mensaje = 'Categoría eliminada.';
        this.cargar();
      },
      error: () => {
        this.error = true;
        this.mensaje =
          'No se pudo eliminar. Puede tener productos asociados.';
      }
    });
  }

  limpiar(borrarMensaje = true): void {
    this.categoria = this.nuevaCategoria();
    this.editando = false;

    if (borrarMensaje) this.mensaje = '';
  }
}
