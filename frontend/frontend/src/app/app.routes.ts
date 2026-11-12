
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./features/empleados/pages/empleado-list/empleado-list.component')
            .then(m => m.EmpleadoListComponent)
      },
      {
        path: 'empleados/nuevo',
        loadComponent: () =>
          import('./features/empleados/pages/empleado-form/empleado-form.component')
            .then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'empleados/editar/:id',
        loadComponent: () =>
          import('./features/empleados/pages/empleado-form/empleado-form.component')
            .then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes.component')
            .then(m => m.ClientesComponent)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categorias.component')
            .then(m => m.CategoriasComponent)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos.component')
            .then(m => m.ProductosComponent)
      },

      // Módulo de Ventas
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas')
            .then(m => m.Ventas)
      },

      // Módulo de Compras
      {
        path: 'compras',
        loadComponent: () =>
          import('./features/compras/compras')
            .then(m => m.Compras)
      },

      // Módulo de Reportes
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes/reportes')
            .then(m => m.Reportes)
      },

      // Módulo de Proveedores
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/proveedores/proveedores.component')
            .then(m => m.ProveedoresComponent)
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
