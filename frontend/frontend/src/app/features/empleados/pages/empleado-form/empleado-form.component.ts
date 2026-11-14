import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmpleadoService } from '../../../../core/services/empleado.service';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './empleado-form.component.html',
  styleUrls: ['./empleado-form.component.css']
})
export class EmpleadoFormComponent implements OnInit {
  formEmpleado: FormGroup;
  esEdicion: boolean = false;
  idEmpleado?: number;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formEmpleado = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      ci: ['', Validators.required],
      telefono: [''],
      email: ['', [Validators.email]],
      cargo: ['', Validators.required],
      estado: [true],
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idEmpleado = +idParam;
      this.esEdicion = true;
      
      // Si estamos editando, la contraseña no es obligatoria
      this.formEmpleado.get('contrasena')?.clearValidators();
      this.formEmpleado.get('contrasena')?.updateValueAndValidity();

      this.empleadoService.obtenerEmpleadoPorId(this.idEmpleado).subscribe((emp) => {
        this.formEmpleado.patchValue({
          nombres: emp.nombre,
          apellidos: emp.apellido,
          ci: emp.cedula,
          telefono: emp.telefono,
          email: emp.email,
          cargo: emp.cargo,
          estado: emp.estado,
          usuario: emp.usuario,
          contrasena: '' // No mostramos la contraseña encriptada
        });
      });
    }
  }

  guardar(): void {
    if (this.formEmpleado.invalid) return;

    const valores = this.formEmpleado.value;
    
    const datos: any = {
      nombre: valores.nombres,
      apellido: valores.apellidos,
      cedula: valores.ci,
      telefono: valores.telefono,
      email: valores.email,
      cargo: valores.cargo,
      estado: valores.estado,
      usuario: valores.usuario,
      fechaIngreso: new Date().toISOString().split('T')[0],
      administrador: { idAdministrador: 1 }
    };

    // Solo enviamos la contraseña si escribió una nueva
    if (valores.contrasena) {
      datos.contrasena = valores.contrasena;
    }

    if (this.esEdicion && this.idEmpleado) {
      this.empleadoService.actualizarEmpleado(this.idEmpleado, datos).subscribe({
        next: () => this.router.navigate(['/admin/empleados'], { state: { editado: true } }),
        error: (err) => alert('Error al actualizar: ' + (err.error?.message || 'Revisa consola'))
      });
    } else {
      this.empleadoService.crearEmpleado(datos).subscribe({
        next: () => this.router.navigate(['/admin/empleados'], { state: { creado: true } }),
        error: (err) => alert('Error al crear: ' + (err.error?.message || 'Faltan datos'))
      });
    }
  }
}
