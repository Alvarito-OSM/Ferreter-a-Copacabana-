import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, ROLES } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  private readonly administrador = [ROLES.administrador];
  private readonly personal = [ROLES.administrador, ROLES.empleado];

  menuItems: MenuItem[] = [
    { label: 'Panel de control', path: '/admin/dashboard', icon: 'bi-speedometer2', roles: this.administrador },
    { label: 'Punto de venta', path: '/admin/punto-venta', icon: 'bi-cash-coin', roles: [ROLES.empleado] },
    { label: 'Productos', path: '/admin/productos', icon: 'bi-box-seam', roles: this.personal },
    { label: 'Categorías', path: '/admin/categorias', icon: 'bi-tags', roles: this.personal },
    { label: 'Clientes', path: '/admin/clientes', icon: 'bi-people', roles: this.personal },
    { label: 'Proveedores', path: '/admin/proveedores', icon: 'bi-truck', roles: this.administrador },
    { label: 'Empleados', path: '/admin/empleados', icon: 'bi-person-badge', roles: this.administrador },
    { label: 'Ventas', path: '/admin/ventas', icon: 'bi-cart-check', roles: this.personal },
    { label: 'Compras', path: '/admin/compras', icon: 'bi-bag-check', roles: this.administrador },
    { label: 'Inventario', path: '/admin/inventario', icon: 'bi-boxes', roles: this.personal },
    { label: 'Reportes', path: '/admin/reportes', icon: 'bi-bar-chart-line', roles: this.administrador },
    { label: 'Configuración', path: '/admin/configuracion', icon: 'bi-gear', roles: this.administrador }
  ];

  constructor(private authService: AuthService) {}

  get menuVisible(): MenuItem[] {
    const rol = this.authService.getRol() ?? '';
    return this.menuItems.filter(item => item.roles.includes(rol));
  }
}
