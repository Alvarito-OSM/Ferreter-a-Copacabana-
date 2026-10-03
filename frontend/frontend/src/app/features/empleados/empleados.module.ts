import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { EmpleadoListComponent } from './pages/empleado-list/empleado-list.component';
import { EmpleadoFormComponent } from './pages/empleado-form/empleado-form.component';

@NgModule({
  declarations: [
    EmpleadoListComponent,
    EmpleadoFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmpleadosRoutingModule
  ]
})
export class EmpleadosModule { }
