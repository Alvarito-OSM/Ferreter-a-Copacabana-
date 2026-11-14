import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent implements OnInit {

  editandoEmpresa: boolean = false;
  editandoPerfil: boolean = false;

  datosEmpresa: any = {};
  perfilAdmin: any = {};

  backupEmpresa: any = {};
  backupPerfil: any = {};

  constructor(/* private http: HttpClient */) {}

  ngOnInit(): void {
    this.datosEmpresa = {
      nombre: 'Ferretería Copacabana',
      nit: '78585648',
      direccion: 'Av. 14 de Septiembre, Localidad Reyes Beni',
      ciudad: 'Reyes, Beni',
      telefono: '+591 78779202'
    };

    this.perfilAdmin = {
      nombre: 'admin_copacabana',
      email: 'admin@ferreteriacopacabana.com',
      password: ''
    };
  }

  activarEdicionEmpresa() {
    this.backupEmpresa = { ...this.datosEmpresa };
    this.editandoEmpresa = true;
  }

  guardarEmpresa() {
    
    alert('Datos de la empresa actualizados en la Base de Datos.');
    this.editandoEmpresa = false;
  }

  cancelarEmpresa() {
    this.datosEmpresa = { ...this.backupEmpresa }; 
    this.editandoEmpresa = false;
  }

  activarEdicionPerfil() {
    this.backupPerfil = { ...this.perfilAdmin };
    this.editandoPerfil = true;
  }

  guardarPerfil() {
    alert('Perfil de administrador actualizado.');
    this.editandoPerfil = false;
    this.perfilAdmin.password = ''; 
  }

  cancelarPerfil() {
    this.perfilAdmin = { ...this.backupPerfil };
    this.editandoPerfil = false;
  }
}
