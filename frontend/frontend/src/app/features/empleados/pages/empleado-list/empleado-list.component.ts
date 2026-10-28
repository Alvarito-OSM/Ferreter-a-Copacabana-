import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { EmpleadoService } from '../../../../core/services/empleado.service';
import { Empleado } from '../../../../core/models/empleado';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empleado-list.component.html',
  styleUrls: ['./empleado-list.component.css']
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];
  mensajeExito: string = '';

  constructor(
    private empleadoService: EmpleadoService,
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Agregamos esto para forzar la vista
  ) { }

  ngOnInit(): void {
    // Revisamos si venimos de crear o editar un empleado
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;
    
    if (state['creado']) {
      this.mensajeExito = '¡Empleado añadido exitosamente!';
    } else if (state['editado']) {
      this.mensajeExito = '¡Empleado actualizado exitosamente!';
    }
    
    if (this.mensajeExito) {
      setTimeout(() => this.mensajeExito = '', 3000);
    }

    // Cargamos los empleados
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.obtenerEmpleados().subscribe({
      next: (data: Empleado[]) => {
        this.empleados = data;
        this.cdr.detectChanges(); // <-- FORZAMOS A ANGULAR A ACTUALIZAR LA TABLA
        console.log('Empleados cargados:', data);
      },
      error: (err: any) => {
        console.error('Error al cargar empleados', err);
      }
    });
  }

  eliminar(id: number | undefined): void {
   if (id && confirm('¿Estás seguro de eliminar este empleado?')) {
      this.empleadoService.eliminarEmpleado(id).subscribe({
        next: () => {
          this.cargarEmpleados(); 
          this.mensajeExito = 'Empleado eliminado correctamente';
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err: any) => alert('Error al eliminar: ' + (err.error?.message || 'Error del servidor'))
      });
    }
  }
}
