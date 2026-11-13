import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  soloAdmin?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  menuItems: MenuItem[] = [
    {
      label: 'Panel de control',
      path: '/admin/dashboard', // 👈 Agregamos /admin
      icon: 'bi-speedometer2'
    },
    {
      label: 'Productos',
      path: '/admin/productos', // 👈 Agregamos /admin
      icon: 'bi-box-seam'
    },
    {
      label: 'Categorías',
      path: '/admin/categorias', // 👈 Agregamos /admin
      icon: 'bi-tags'
    },
    {
      label: 'Clientes',
      path: '/admin/clientes', // 👈 Agregamos /admin
      icon: 'bi-people'
    },
    {
      label: 'Proveedores',
      path: '/admin/proveedores', // 👈 Agregamos /admin
      icon: 'bi-truck',
      soloAdmin: true
    },
    {
      label: 'Empleados',
      path: '/admin/empleados', // 👈 Agregamos /admin
      icon: 'bi-person-badge',
      soloAdmin: true
    },
    {
      label: 'Ventas',
      path: '/admin/ventas', // 👈 Agregamos /admin
      icon: 'bi-cart-check'
    },
    {
      label: 'Compras',
      path: '/admin/compras', // 👈 Agregamos /admin
      icon: 'bi-bag-check',
      soloAdmin: true
    },
        { label: 'Inventario',
           path: '/admin/inventario',
           icon: 'bi-boxes' },
    {
      label: 'Reportes',
      path: '/admin/reportes', // 👈 Agregamos /admin
      icon: 'bi-bar-chart-line',
      soloAdmin: true
    },
    // 👇 NUEVA OPCIÓN 👇
    { label: 'Configuración', 
      path: '/admin/configuracion',
       icon: 'bi-gear',
      soloAdmin: true } 
  ];

  constructor(private authService: AuthService) {}

  get esAdmin(): boolean {
    return this.authService.isAdministrador();
  }

  get menuVisible(): MenuItem[] {
    if (this.esAdmin) {
      return this.menuItems;
    }

    return this.menuItems.filter(
      item => !item.soloAdmin
    );
  }
}
