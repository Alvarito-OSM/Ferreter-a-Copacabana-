import { Component, OnInit } from '@angular/core';
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
    private router: Router
  ) { }

  ngOnInit(): void {
    // Revisamos si venimos de crear o editar un empleado
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      if (navigation.extras.state['creado']) {
        this.mensajeExito = '¡Empleado añadido exitosamente!';
      } else if (navigation.extras.state['editado']) {
        this.mensajeExito = '¡Empleado actualizado exitosamente!';
      }
      
      // Ocultar el mensaje después de 3 segundos
      if (this.mensajeExito) {
        setTimeout(() => this.mensajeExito = '', 3000);
      }
    }

    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.obtenerEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
        console.log('Empleados cargados:', data); // Esto nos dirá en consola si llegan datos
      },
      error: (err) => {
        console.error('Error al cargar empleados', err);
        alert('Error de seguridad o conexión al cargar empleados. Revisa la consola.');
      }
    });
  }

  eliminar(id: number | undefined): void {
   if (id && confirm('¿Estás seguro de eliminar este empleado?')) {
      this.empleadoService.eliminarEmpleado(id).subscribe({
        next: () => {
          // Volvemos a pedir la lista al backend para que se actualice en pantalla
          this.cargarEmpleados(); 
          this.mensajeExito = 'Empleado eliminado correctamente';
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => alert('Error al eliminar: ' + err.error.message)
      });
    }
  }
}
