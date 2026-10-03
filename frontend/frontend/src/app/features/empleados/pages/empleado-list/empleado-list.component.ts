import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from '../../../../core/services/empleado.service';
import { Empleado } from '../../../../core/models/empleado';

@Component({
  selector: 'app-empleado-list',
  templateUrl: './empleado-list.component.html',
  styleUrls: ['./empleado-list.component.css']
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];

  constructor(private empleadoService: EmpleadoService) { }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.obtenerEmpleados().subscribe({
      next: (data) => this.empleados = data,
      error: (err) => console.error('Error al cargar empleados', err)
    });
  }

  eliminar(id: number | undefined): void {
    if (id && confirm('¿Deseas eliminar este empleado?')) {
      this.empleadoService.eliminarEmpleado(id).subscribe(() => {
        this.cargarEmpleados();
      });
    }
  }
}
