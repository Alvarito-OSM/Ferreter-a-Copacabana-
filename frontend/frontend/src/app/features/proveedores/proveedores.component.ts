import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Proveedor } from '../../core/models/proveedor';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  formProveedor: FormGroup;
  esEdicion = false;
  idEdicion?: number;
  mostrarFormulario = false;
  busqueda = '';
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private proveedorService: ProveedorService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef // 👈 Volvemos a inyectar esto
  ) {
    this.formProveedor = this.fb.group({
      razonSocial: ['', [Validators.required, Validators.maxLength(150)]],
      nit: ['', [Validators.required, Validators.maxLength(20)]],
      contacto: ['', Validators.maxLength(100)],
      telefono: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      direccion: ['', Validators.maxLength(255)],
      estado: [true]
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  get proveedoresFiltrados(): Proveedor[] {
    const texto = this.busqueda.trim().toLowerCase();
    if (!texto) return this.proveedores;
    
    return this.proveedores.filter(p =>
      p.razonSocial.toLowerCase().includes(texto) ||
      p.nit.toLowerCase().includes(texto) ||
      (p.contacto ?? '').toLowerCase().includes(texto)
    );
  }

  cargarProveedores(): void {
    this.proveedorService.listar().subscribe({
      next: (data: Proveedor[]) => {
        this.proveedores = data;
        // 👇 ESTA ES LA LÍNEA MÁGICA QUE HACE QUE APAREZCAN DE INMEDIATO 👇
        this.cdr.detectChanges(); 
      },
      error: (err: HttpErrorResponse) => this.mostrarError(err, 'No se pudo cargar la lista de proveedores.')
    });
  }

  verDetalle(proveedor: Proveedor): void {
    this.router.navigate(['/admin/proveedores', proveedor.idProveedor]);
  }

  buscar(): void {
    // Al presionar buscar o enter, forzamos la actualización por si acaso
    this.cdr.detectChanges();
  }

  abrirFormulario(proveedor?: Proveedor): void {
    this.mostrarFormulario = true;
    this.mensajeError = '';
    if (proveedor) {
      this.esEdicion = true;
      this.idEdicion = proveedor.idProveedor;
      this.formProveedor.patchValue({
        razonSocial: proveedor.razonSocial,
        nit: proveedor.nit,
        contacto: proveedor.contacto ?? '',
        telefono: proveedor.telefono ?? '',
        email: proveedor.email ?? '',
        direccion: proveedor.direccion ?? '',
        estado: proveedor.estado ?? true
      });
    } else {
      this.esEdicion = false;
      this.idEdicion = undefined;
      this.formProveedor.reset({ estado: true });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formProveedor.reset({ estado: true });
  }

  invalido(campo: string): boolean {
    const control = this.formProveedor.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  guardar(): void {
    if (this.formProveedor.invalid) {
      this.formProveedor.markAllAsTouched();
      return;
    }

    const v = this.formProveedor.value;
    const datos: Proveedor = {
      razonSocial: v.razonSocial.trim(),
      nit: v.nit.trim(),
      contacto: v.contacto?.trim() || null,
      telefono: v.telefono?.trim() || null,
      email: v.email?.trim() || null,
      direccion: v.direccion?.trim() || null,
      estado: v.estado
    };

    if (this.esEdicion && this.idEdicion != null) {
      this.proveedorService.actualizar(this.idEdicion, datos).subscribe({
        next: () => this.finalizarGuardado('Proveedor actualizado correctamente'),
        error: (err: HttpErrorResponse) => this.mostrarError(err, 'No se pudo actualizar el proveedor.')
      });
    } else {
      this.proveedorService.crear(datos).subscribe({
        next: () => this.finalizarGuardado('Proveedor registrado correctamente'),
        error: (err: HttpErrorResponse) => this.mostrarError(err, 'No se pudo registrar el proveedor.')
      });
    }
  }

  finalizarGuardado(mensaje: string): void {
    this.mensajeError = '';
    this.mensajeExito = mensaje;
    this.cerrarFormulario();
    this.cargarProveedores();
    setTimeout(() => {
      this.mensajeExito = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  eliminar(proveedor: Proveedor): void {
    if (proveedor.idProveedor == null) return;
    if (!confirm(`¿Estás seguro de eliminar al proveedor "${proveedor.razonSocial}"?`)) return;

    this.proveedorService.eliminar(proveedor.idProveedor).subscribe({
      next: () => {
        this.mensajeError = '';
        this.mensajeExito = 'Proveedor eliminado';
        this.cargarProveedores();
        setTimeout(() => {
          this.mensajeExito = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: HttpErrorResponse) =>
        this.mostrarError(err, 'No se pudo eliminar. Puede tener compras asociadas.')
    });
  }

  private mostrarError(err: HttpErrorResponse, mensajePorDefecto: string): void {
    if (err.status === 0) {
      this.mensajeError = 'No se pudo conectar con el servidor.';
    } else if (err.status === 401 || err.status === 403) {
      this.mensajeError = 'No tienes permiso o tu sesión venció.';
    } else {
      this.mensajeError = mensajePorDefecto;
    }
    this.cdr.detectChanges();
  }
}
