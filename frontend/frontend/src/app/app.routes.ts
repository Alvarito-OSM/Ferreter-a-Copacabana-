import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'empleados',
        loadComponent: () => import('./features/empleados/pages/empleado-list/empleado-list.component').then(m => m.EmpleadoListComponent)
      },
      {
        path: 'empleados/nuevo',
        loadComponent: () => import('./features/empleados/pages/empleado-form/empleado-form.component').then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'empleados/editar/:id',
        loadComponent: () => import('./features/empleados/pages/empleado-form/empleado-form.component').then(m => m.EmpleadoFormComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
