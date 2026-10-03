import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'empleados',
    loadChildren: () => import('./features/empleados/empleados.module').then(m => m.EmpleadosModule)
  },
  { path: '', redirectTo: 'empleados', pathMatch: 'full' }
];
