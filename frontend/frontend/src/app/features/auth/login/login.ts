import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  usuario = '';
  contrasena = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.error = '';
    this.cargando = true;

    // 👇 CAMBIO IMPORTANTE: Spring Security espera 'username' y 'password' 👇
    this.authService.login({
      usuario: this.usuario,   // El AuthService se encargará de traducir esto
      contrasena: this.contrasena
    }).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        this.cargando = false;
        // Redirigimos al panel de administración
        this.router.navigate(['/admin/dashboard']); 
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Usuario o contraseña incorrectos';
        console.error('Error del backend:', err);
      }
    });
  }

  loginConGoogle(): void {
    alert('El inicio de sesión con Google estará disponible próximamente. Por favor, use su usuario y contraseña.');
  }
}
