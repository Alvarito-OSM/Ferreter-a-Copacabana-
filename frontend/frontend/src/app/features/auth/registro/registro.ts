import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {

  nuevoCliente: any = {
    nombre: '',
    apellido: '',
    cedulaNit: '',
    telefono: '',
    email: '',
    direccion: '',
    usuario: '',
    contrasena: ''
  };

  cargando = false;
  error = '';
  exito = false;
  apiUrl = 'http://localhost:8080/api/auth/registro';

  constructor(private http: HttpClient, private router: Router) {}

  guardarCliente() {
    this.error = '';
    
    // Validación básica
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.cedulaNit) {
      this.error = 'El nombre y la cédula/NIT son obligatorios.';
      return;
    }

    if (this.nuevoCliente.usuario.trim().length < 4 || this.nuevoCliente.contrasena.length < 6) {
      this.error = 'Usuario de 4+ caracteres y contraseña de 6+ caracteres.';
      return;
    }

    this.cargando = true;

    // Enviamos los datos a tu backend (EndPoint de Clientes)
    this.http.post(this.apiUrl, this.nuevoCliente).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = true;
        
        // Después de 2 segundos, lo mandamos al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al registrar. Verifica que la cédula no esté ya registrada.';
      }
    });
  }
}
