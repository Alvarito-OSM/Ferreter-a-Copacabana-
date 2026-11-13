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
  mostrarContrasena = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (this.cargando) return;

    this.error = '';
    this.cargando = true;

    this.authService.login({
      usuario: this.usuario,
      contrasena: this.contrasena
    }).subscribe({
      next: (res: any) => {
        this.cargando = false;

        if (res && res.token) {
          localStorage.setItem('token', res.token);
        }

        // 👇 CAMBIO CLAVE: Ahora redirige a /admin/dashboard 👇
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Usuario o contraseña incorrectos';
        console.error(err);
      }
    });
  }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  loginConGoogle(): void {
    alert(
      'El inicio de sesión con Google estará disponible próximamente. Por favor, use su usuario y contraseña.'
    );
  }
}
