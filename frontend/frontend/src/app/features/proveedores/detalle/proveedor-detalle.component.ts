import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProveedorResumen } from '../../../core/models/proveedor-resumen';

type Pestana = 'productos' | 'compras';

@Component({
  selector: 'app-proveedor-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedor-detalle.component.html',
  styleUrls: ['./proveedor-detalle.component.css']
})
export class ProveedorDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly proveedorService = inject(ProveedorService);

  readonly resumen = signal<ProveedorResumen | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly pestana = signal<Pestana>('productos');

  readonly promedioPorCompra = computed(() => {
    const datos = this.resumen();
    return datos && datos.totalCompras > 0 ? datos.totalGastado / datos.totalCompras : 0;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.proveedorService.obtenerResumen(id).subscribe({
      next: datos => {
        this.resumen.set(datos);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err.status === 404
          ? 'No se encontró el proveedor solicitado.'
          : 'No se pudo cargar la información del proveedor.');
        this.cargando.set(false);
      }
    });
  }

  cambiarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
  }

  volver(): void {
    this.router.navigate(['/admin/proveedores']);
  }
}
