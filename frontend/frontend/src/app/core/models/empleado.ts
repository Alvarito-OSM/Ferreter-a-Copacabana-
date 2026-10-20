export interface Empleado {
  idEmpleado?: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  email?: string;
  cargo: string;
  usuario: string;
  contrasena: string;
  fechaIngreso?: string;
  estado: boolean;
  administrador?: {
    idAdministrador: number;
  };
}
