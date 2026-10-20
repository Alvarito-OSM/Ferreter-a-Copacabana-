import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/categoria';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  formCategoria: FormGroup;
  esEdicion = false;
  idEdicion?: number;
  mostrarFormulario = false;
  busqueda = '';
  mensajeExito = '';

  constructor(
    private categoriaService: CategoriaService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.formCategoria = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    // Usamos obtenerCategorias() que es el que ya tenías
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar categorías', err)
    });
  }

  buscar(): void {
    if (!this.busqueda.trim()) {
      this.cargarCategorias();
      return;
    }
    const busquedaLower = this.busqueda.toLowerCase();
    this.categorias = this.categorias.filter(c => 
      c.nombre.toLowerCase().includes(busquedaLower)
    );
    this.cdr.detectChanges();
  }

  abrirFormulario(categoria?: Categoria): void {
    this.mostrarFormulario = true;
    if (categoria) {
      this.esEdicion = true;
      this.idEdicion = categoria.idCategoria;
      this.formCategoria.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion
      });
    } else {
      this.esEdicion = false;
      this.idEdicion = undefined;
      this.formCategoria.reset();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formCategoria.reset();
  }

  guardar(): void {
    if (this.formCategoria.invalid) return;

    const valores = this.formCategoria.value;

    if (this.esEdicion && this.idEdicion) {
      // CAMBIO: Usamos actualizar() en lugar de actualizarCategoria()
      this.categoriaService.actualizar(this.idEdicion, valores).subscribe({
        next: () => this.finalizarGuardado('Categoría actualizada correctamente'),
        error: (err: any) => alert('Error al actualizar: ' + (err.error?.message || 'Revisa la consola'))
      });
    } else {
      // CAMBIO: Usamos crear() en lugar de crearCategoria()
      this.categoriaService.crear(valores).subscribe({
        next: () => this.finalizarGuardado('Categoría creada correctamente'),
        error: (err: any) => alert('Error al crear: ' + (err.error?.message || 'Revisa la consola'))
      });
    }
  }

  finalizarGuardado(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.cerrarFormulario();
    this.cargarCategorias();
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  eliminar(id?: number): void {
    if (id && confirm('¿Estás seguro de eliminar esta categoría?')) {
      // CAMBIO: Usamos eliminar() en lugar de eliminarCategoria()
      this.categoriaService.eliminar(id).subscribe({
        next: () => {
          this.mensajeExito = 'Categoría eliminada';
          this.cargarCategorias();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err: any) => alert('Error al eliminar: ' + (err.error?.message || 'Error del servidor'))
      });
    }
  }
}
