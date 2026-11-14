import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { inject } from '@angular/core';
import { AuthService, ROLES } from './core/services/auth.service';
import { LayoutComponent } from './shared/components/layout/layout.component';

const soloAdmin = { roles: [ROLES.administrador] };
const personal = { roles: [ROLES.administrador, ROLES.empleado] };

export const routes: Routes = [
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
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },
  {
    path: 'registro',
    loadComponent: () => 
      import('./features/auth/registro/registro')
        .then(m => m.RegistroComponent)
  },
  {
    path: 'admin', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'empleados',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/empleados/pages/empleado-list/empleado-list.component')
            .then(m => m.EmpleadoListComponent)
      },
      {
        path: 'empleados/nuevo',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/empleados/pages/empleado-form/empleado-form.component')
            .then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'empleados/editar/:id',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/empleados/pages/empleado-form/empleado-form.component')
            .then(m => m.EmpleadoFormComponent)
      },
      {
        path: 'clientes',
        canActivate: [rolGuard],
        data: personal,
        loadComponent: () =>
          import('./features/clientes/clientes.component')
            .then(m => m.ClientesComponent)
      },
      {
        path: 'categorias',
        canActivate: [rolGuard],
        data: personal,
        loadComponent: () =>
          import('./features/categorias/categorias.component')
            .then(m => m.CategoriasComponent)
      },
      {
        path: 'productos',
        canActivate: [rolGuard],
        data: personal,
        loadComponent: () =>
          import('./features/productos/productos.component')
            .then(m => m.ProductosComponent)
      },
      {
        path: 'proveedores',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/proveedores/proveedores.component')
            .then(m => m.ProveedoresComponent)
      },
      {
        path: 'proveedores/:id',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/proveedores/detalle/proveedor-detalle.component')
            .then(m => m.ProveedorDetalleComponent)
      },
      {
        path: 'ventas',
        canActivate: [rolGuard],
        data: personal,
        loadComponent: () =>
          import('./features/ventas/historial-ventas/historial-ventas')
            .then(m => m.HistorialVentasComponent)
      },
      {
        path: 'punto-venta',
        canActivate: [rolGuard],
        data: { roles: [ROLES.empleado] },
        loadComponent: () =>
          import('./features/ventas/pos/pos')
            .then(m => m.PosComponent) // Si te marca error aquí, cambia PosComponent por PuntoVentaComponent
      },
      {
        path: 'compras',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/compras/compras')
            .then(m => m.ComprasComponent) // 👈 AQUÍ ESTABA EL ERROR (Decía m.Compras)
      },
      {
        path: 'reportes',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/reportes/reportes/reportes')
            .then(m => m.Reportes)
      },
      {
        path: 'inventario',
        canActivate: [rolGuard],
        data: personal,
        loadComponent: () =>
          import('./features/inventario/inventario')
            .then(m => m.InventarioComponent)
      },      
      {
        path: 'configuracion',
        canActivate: [rolGuard],
        data: soloAdmin,
        loadComponent: () =>
          import('./features/configuracion/configuracion')
            .then(m => m.ConfiguracionComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).rutaInicio() }
    ]
  },
  { path: '**', redirectTo: '' }
];
