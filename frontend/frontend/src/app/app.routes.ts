import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // 👇 1. LA RAÍZ CARGA EL CATÁLOGO PÚBLICO 👇
  {
    path: '',
    loadComponent: () => import('./features/catalogo-publico/catalogo-publico').then(m => m.CatalogoPublicoComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalogo-publico/catalogo-publico').then(m => m.CatalogoPublicoComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },

  // 👇 2. EL PANEL PRIVADO AHORA VIVE EN /admin (o como quieras llamarlo) 👇
  {
    path: 'admin', 
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
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/categorias/categorias.component').then(m => m.CategoriasComponent)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos.component')
            .then(m => m.ProductosComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./features/proveedores/proveedores.component').then(m => m.ProveedoresComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./features/ventas/historial-ventas/historial-ventas').then(m => m.HistorialVentasComponent)
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 👇 3. CUALQUIER OTRA RUTA VUELVE AL CATÁLOGO 👇
  { path: '**', redirectTo: '' }
];
