// Crear archivo: frontend/frontend/src/app/features/clientes/clientes.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  Cliente,
  ClienteService
} from '../../core/services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="clientes">
      <header>
        <h1>Clientes</h1>
        <button type="button" (click)="nuevo()" [disabled]="ocupado()">
          Nuevo cliente
        </button>
      </header>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      @if (mensaje()) {
        <p class="exito" role="status">{{ mensaje() }}</p>
      }

      @if (mostrarFormulario()) {
        <form #formulario="ngForm" (ngSubmit)="guardar(formulario)" class="tarjeta">
          <h2>{{ cliente.idCliente ? 'Editar cliente' : 'Registrar cliente' }}</h2>

          <fieldset [disabled]="ocupado()">
            <div class="campos">
              <label>
                Nombre *
                <input
                  name="nombre"
                  [(ngModel)]="cliente.nombre"
                  required
                  maxlength="100"
                />
              </label>

              <label>
                Apellido
                <input
                  name="apellido"
                  [(ngModel)]="cliente.apellido"
                  maxlength="100"
                />
              </label>

              <label>
                CI / NIT *
                <input
                  name="cedulaNit"
                  [(ngModel)]="cliente.cedulaNit"
                  required
                  maxlength="20"
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  name="telefono"
                  [(ngModel)]="cliente.telefono"
                  maxlength="20"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="cliente.email"
                  email
                  maxlength="150"
                />
              </label>

              <label>
                Dirección
                <input
                  name="direccion"
                  [(ngModel)]="cliente.direccion"
                  maxlength="255"
                />
              </label>

              <label>
                Estado
                <select name="estado" [(ngModel)]="cliente.estado">
                  <option [ngValue]="true">Activo</option>
                  <option [ngValue]="false">Inactivo</option>
                </select>
              </label>
            </div>

            <div class="acciones">
              <button type="submit" [disabled]="formulario.invalid || ocupado()">
                {{ ocupado() ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" class="secundario" (click)="cancelar()">
                Cancelar
              </button>
            </div>
          </fieldset>
        </form>
      }

      <form class="busqueda" (ngSubmit)="cargar()">
        <input
          name="busqueda"
          [(ngModel)]="busqueda"
          placeholder="Buscar por nombre, apellido o CI/NIT"
          aria-label="Buscar clientes"
        />
        <button type="submit" [disabled]="cargando() || ocupado()">
          Buscar
        </button>
      </form>

      @if (cargando()) {
        <p role="status">Cargando clientes...</p>
      } @else {
        <div class="tabla">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>CI / NIT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of clientes(); track item.idCliente) {
                <tr>
                  <td>{{ item.nombre }} {{ item.apellido }}</td>
                  <td>{{ item.cedulaNit }}</td>
                  <td>{{ item.telefono || '—' }}</td>
                  <td>{{ item.email || '—' }}</td>
                  <td>{{ item.estado ? 'Activo' : 'Inactivo' }}</td>
                  <td>
                    <div class="acciones">
                      <button
                        type="button"
                        class="secundario"
                        (click)="editar(item)"
                        [disabled]="ocupado()"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="peligro"
                        (click)="eliminar(item)"
                        [disabled]="ocupado()"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6">No se encontraron clientes.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .clientes { padding: 24px; color: #1e293b; }
    header, .acciones, .busqueda {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    header { justify-content: space-between; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 28px; }
    h2 { margin-top: 0; font-size: 20px; }
    .tarjeta, .tabla {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }
    .tarjeta { padding: 20px; margin-bottom: 20px; }
    fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
    .campos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    label { display: flex; flex-direction: column; gap: 6px; }
    input, select, button { font: inherit; }
    input, select {
      padding: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-sizing: border-box;
      width: 100%;
    }
    button {
      padding: 10px 16px;
      border: 0;
      border-radius: 6px;
      background: #2563eb;
      color: white;
      cursor: pointer;
    }
    button:disabled { opacity: .55; cursor: not-allowed; }
    .secundario { background: #e2e8f0; color: #1e293b; }
    .peligro { background: #b91c1c; }
    .busqueda { margin-bottom: 20px; }
    .busqueda input { flex: 1; min-width: 200px; }
    .tabla { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th { background: #f8fafc; }
    .error, .exito { padding: 12px; border-radius: 6px; }
    .error { background: #fee2e2; color: #991b1b; }
    .exito { background: #dcfce7; color: #166534; }
  `]
})
export class ClientesComponent implements OnInit {
  private readonly servicio = inject(ClienteService);

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
    if (this.cargando()) {
      return;
    }

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
    if (formulario.invalid || this.ocupado()) {
      return;
    }

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

    solicitud
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.cancelar();
          this.mensaje.set('Cliente guardado correctamente.');
          this.cargar();
        },
        error: error => this.mostrarError(error)
      });
  }

  eliminar(cliente: Cliente): void {
    if (cliente.idCliente == null || this.ocupado()) {
      return;
    }

    const confirmado = window.confirm(
      `¿Eliminar definitivamente a ${cliente.nombre} ${cliente.apellido || ''}?`
    );

    if (!confirmado) {
      return;
    }

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
            this.error.set(
              'No se pudo eliminar el cliente. Puede tener registros asociados.'
            );
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