import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  
  clientes: any[] = [];
  busqueda: string = '';
  apiUrl = 'http://localhost:8080/api/clientes';

  // Variables para el Modal
  modalAbierto: boolean = false;
  editando: boolean = false;
  clienteForm: any = {
    idCliente: null,
    nombre: '',
    apellido: '',
    cedulaNit: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    // Usamos el parámetro 'q' que espera tu backend para la búsqueda
    this.http.get<any[]>(`${this.apiUrl}?q=${this.busqueda}`).subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error('Error cargando clientes', err)
    });
  }

  buscar() {
    this.cargarClientes();
  }

  abrirModalNuevo() {
    this.editando = false;
    this.clienteForm = { idCliente: null, nombre: '', apellido: '', cedulaNit: '', telefono: '', email: '', direccion: '' };
    this.modalAbierto = true;
  }

  abrirModalEditar(cliente: any) {
    this.editando = true;
    // Clonamos el objeto para no modificar la tabla directamente mientras escribimos
    this.clienteForm = { ...cliente };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarCliente() {
    if (!this.clienteForm.nombre || !this.clienteForm.cedulaNit) {
      return alert('El Nombre y la Cédula/NIT son obligatorios');
    }

    if (this.editando) {
      // Actualizar (PUT)
      this.http.put(`${this.apiUrl}/${this.clienteForm.idCliente}`, this.clienteForm).subscribe({
        next: () => {
          alert('Cliente actualizado con éxito');
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err) => alert('Error: ' + (err.error?.mensaje || 'No se pudo actualizar'))
      });
    } else {
      // Crear (POST)
      this.http.post(this.apiUrl, this.clienteForm).subscribe({
        next: () => {
          alert('Cliente registrado con éxito');
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err) => alert('Error: ' + (err.error?.mensaje || 'No se pudo crear'))
      });
    }
  }

  // Tu backend hace un DELETE lógico (desactivar)
  eliminarCliente(id: number) {
    if (!confirm('¿Estás seguro de desactivar este cliente?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        alert('Cliente desactivado');
        this.cargarClientes();
      },
      error: (err) => alert('Error al desactivar: ' + (err.error?.mensaje || 'Verifique las ventas asociadas'))
    });
  }
}
