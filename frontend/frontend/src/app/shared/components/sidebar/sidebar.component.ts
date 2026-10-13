import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  path: string;
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
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Productos', path: '/productos' },
    { label: 'Categorías', path: '/categorias' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'Proveedores', path: '/proveedores' },
    { label: 'Empleados', path: '/empleados', soloAdmin: true },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Ventas', path: '/ventas' },
    { label: 'Compras', path: '/compras' },
    { label: 'Pagos', path: '/pagos' },
    { label: 'Reportes', path: '/reportes', soloAdmin: true }
  ];

  constructor(private authService: AuthService) {}

  get esAdmin(): boolean {
    return this.authService.isAdministrador();
  }

  get menuVisible(): MenuItem[] {
    if (this.esAdmin) return this.menuItems;
    return this.menuItems.filter(item => !item.soloAdmin);
  }
}
