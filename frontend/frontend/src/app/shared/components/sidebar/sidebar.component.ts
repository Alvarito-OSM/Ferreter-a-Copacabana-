
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
      path: '/dashboard',
      icon: 'bi-speedometer2'
    },
    {
      label: 'Productos',
      path: '/productos',
      icon: 'bi-box-seam'
    },
    {
      label: 'Categorías',
      path: '/categorias',
      icon: 'bi-tags'
    },
    {
      label: 'Clientes',
      path: '/clientes',
      icon: 'bi-people'
    },
    {
      label: 'Proveedores',
      path: '/proveedores',
      icon: 'bi-truck',
      soloAdmin: true
    },
    {
      label: 'Empleados',
      path: '/empleados',
      icon: 'bi-person-badge',
      soloAdmin: true
    },
    {
      label: 'Ventas',
      path: '/ventas',
      icon: 'bi-cart-check'
    },
    {
      label: 'Compras',
      path: '/compras',
      icon: 'bi-bag-check',
      soloAdmin: true
    },
    {
      label: 'Reportes',
      path: '/reportes',
      icon: 'bi-bar-chart-line',
      soloAdmin: true
    }
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
