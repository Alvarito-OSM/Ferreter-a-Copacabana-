import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../../../core/services/empleado.service';

@Component({
  selector: 'app-empleado-form',
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
      estado: [true]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idEmpleado = +idParam;
      this.esEdicion = true;
      this.empleadoService.obtenerEmpleadoPorId(this.idEmpleado).subscribe((emp) => {
        this.formEmpleado.patchValue(emp);
      });
    }
  }

  guardar(): void {
    if (this.formEmpleado.invalid) return;

    const datos = this.formEmpleado.value;

    if (this.esEdicion && this.idEmpleado) {
      this.empleadoService.actualizarEmpleado(this.idEmpleado, datos).subscribe(() => {
        this.router.navigate(['/empleados']);
      });
    } else {
      this.empleadoService.crearEmpleado(datos).subscribe(() => {
        this.router.navigate(['/empleados']);
      });
    }
  }
}
