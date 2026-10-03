import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpleadoListComponent } from './pages/empleado-list/empleado-list.component';
import { EmpleadoFormComponent } from './pages/empleado-form/empleado-form.component';

const routes: Routes = [
  { path: '', component: EmpleadoListComponent },
  { path: 'nuevo', component: EmpleadoFormComponent },
  { path: 'editar/:id', component: EmpleadoFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpleadosRoutingModule { }
