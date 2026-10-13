import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  get rol(): string {
    const rol = this.authService.getRol() || '';
    return rol.replace('ROLE_', '');
  }

  logout(): void {
    this.authService.logout();
  }
}
