import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Cliente, ClienteService } from '../../core/services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  private readonly servicio = inject(ClienteService);

  // Variables reactivas (Signals)
  readonly clientes = signal<Cliente[]>([]);
  readonly cargando = signal(false);
  readonly ocupado = signal(false);
  readonly mostrarFormulario = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');

  busqueda = '';
  cliente: Cliente = this.clienteVacio();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;

    this.cargando.set(true);
    this.error.set('');

    this.servicio.listar(this.busqueda)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: datos => this.clientes.set(datos),
        error: error => this.mostrarError(error)
      });
  }

  nuevo(): void {
    this.cliente = this.clienteVacio();
    this.error.set('');
    this.mensaje.set('');
    this.mostrarFormulario.set(true);
  }

  editar(cliente: Cliente): void {
    this.cliente = { ...cliente };
    this.error.set('');
    this.mensaje.set('');
    this.mostrarFormulario.set(true);
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
    this.cliente = this.clienteVacio();
  }

  guardar(formulario: NgForm): void {
    if (formulario.invalid || this.ocupado()) return;

    const datos: Cliente = {
      ...this.cliente,
      nombre: this.cliente.nombre.trim(),
      apellido: this.cliente.apellido?.trim() || null,
      cedulaNit: this.cliente.cedulaNit.trim(),
      telefono: this.cliente.telefono?.trim() || null,
      email: this.cliente.email?.trim() || null,
      direccion: this.cliente.direccion?.trim() || null
    };

    if (!datos.nombre || !datos.cedulaNit) {
      this.error.set('El nombre y el CI/NIT son obligatorios.');
      return;
    }

    this.ocupado.set(true);
    this.error.set('');
    this.mensaje.set('');

    const solicitud = datos.idCliente != null
      ? this.servicio.actualizar(datos.idCliente, datos)
      : this.servicio.crear(datos);

    solicitud.pipe(finalize(() => this.ocupado.set(false))).subscribe({
      next: () => {
        this.cancelar();
        this.mensaje.set('Cliente guardado correctamente.');
        this.cargar();
      },
      error: error => this.mostrarError(error)
    });
  }

  eliminar(cliente: Cliente): void {
    if (cliente.idCliente == null || this.ocupado()) return;

    const confirmado = window.confirm(`¿Eliminar definitivamente a ${cliente.nombre} ${cliente.apellido || ''}?`);
    if (!confirmado) return;

    this.ocupado.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.servicio.eliminar(cliente.idCliente)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          if (this.cliente.idCliente === cliente.idCliente) {
            this.cancelar();
          }
          this.mensaje.set('Cliente eliminado correctamente.');
          this.cargar();
        },
        error: error => {
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.error.set('No se pudo eliminar el cliente. Puede tener registros asociados.');
          } else {
            this.mostrarError(error);
          }
        }
      });
  }

  private clienteVacio(): Cliente {
    return {
      nombre: '',
      apellido: '',
      cedulaNit: '',
      telefono: '',
      email: '',
      direccion: '',
      estado: true
    };
  }

  private mostrarError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        this.error.set('No se pudo conectar con el backend.');
        return;
      }
      if (error.status === 401) {
        this.error.set('La sesión no es válida. Vuelve a iniciar sesión.');
        return;
      }
      if (error.status === 403) {
        this.error.set('No tienes permiso para realizar esta operación.');
        return;
      }
      const mensaje = error.error?.mensaje;
      if (typeof mensaje === 'string') {
        this.error.set(mensaje);
        return;
      }
    }
    this.error.set('No se pudo completar la operación. Inténtalo nuevamente.');
  }
}
