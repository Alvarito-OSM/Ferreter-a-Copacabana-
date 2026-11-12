
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  modoOscuro = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const temaGuardado = localStorage.getItem('ferreteria-tema');

    this.modoOscuro = temaGuardado === 'oscuro';

    this.aplicarTema();
  }

  get usuario(): string {
    return this.authService.getUsuario() || 'Usuario';
  }

  get rol(): string {
    const rol = this.authService.getRol() || '';
    return rol.replace('ROLE_', '');
  }

  cambiarTema(): void {
    this.modoOscuro = !this.modoOscuro;

    localStorage.setItem(
      'ferreteria-tema',
      this.modoOscuro ? 'oscuro' : 'claro'
    );

    this.aplicarTema();
  }

  private aplicarTema(): void {
    document.documentElement.classList.toggle(
      'dark-mode',
      this.modoOscuro
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
