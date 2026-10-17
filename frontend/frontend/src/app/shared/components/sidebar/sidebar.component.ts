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
    { label: 'Dashboard', path: '/dashboard', icon: '' },
    { label: 'Productos', path: '/productos', icon: '' },
    { label: 'Categorías', path: '/categorias', icon: '' },
    { label: 'Clientes', path: '/clientes', icon: '' },
    { label: 'Empleados', path: '/empleados', icon: '', soloAdmin: true }
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
