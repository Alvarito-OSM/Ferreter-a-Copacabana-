import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent {

  // Datos de la empresa
  datosEmpresa = {
    nombre: 'Ferretería Copacabana',
    nit: '123456789',
    telefono: '+591 78779202',
    direccion: 'Localidad de Reyes, Beni - Bolivia',
    moneda: 'BOB'
  };

  // Datos del perfil del administrador
  perfilAdmin = {
    nombre: 'Admin',
    email: 'admin@ferreteria.com',
    password: ''
  };

  guardarEmpresa() {
    alert('Datos de la empresa guardados (Simulación). Aquí conectarías con tu API.');
  }

  guardarPerfil() {
    alert('Perfil actualizado (Simulación).');
  }
}
