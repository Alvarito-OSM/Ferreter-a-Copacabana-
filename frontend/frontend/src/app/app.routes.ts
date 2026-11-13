import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // 👇 1. EL CATÁLOGO ES LA PÁGINA PRINCIPAL 👇
  {
    path: '',
    loadComponent: () =>
      import('./features/catalogo-publico/catalogo-publico')
        .then(m => m.CatalogoPublicoComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/catalogo-publico/catalogo-publico')
        .then(m => m.CatalogoPublicoComponent)
  },
  
  // 👇 2. LA PÁGINA DE LOGIN Y REGISTRO (PÚBLICAS) 👇
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },
  {
    // 👇 MOVIDO AQUÍ AFUERA PARA QUE SEA PÚBLICO 👇
    path: 'registro',
    loadComponent: () => 
      import('./features/auth/registro/registro')
        .then(m => m.RegistroComponent)
  },

  // 👇 3. EL PANEL PRIVADO (PROTEGIDO POR EL GUARD) 👇
  {
    path: 'admin', 
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
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/proveedores/proveedores.component')
            .then(m => m.ProveedoresComponent)
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas')
            .then(m => m.Ventas)
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./features/compras/compras')
            .then(m => m.Compras)
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes/reportes')
            .then(m => m.Reportes)
      },
            {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario')
            .then(m => m.InventarioComponent)
      },      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/configuracion/configuracion')
            .then(m => m.ConfiguracionComponent)
      },
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // 👇 4. CUALQUIER RUTA DESCONOCIDA VUELVE AL CATÁLOGO 👇
  { path: '**', redirectTo: '' }
];
