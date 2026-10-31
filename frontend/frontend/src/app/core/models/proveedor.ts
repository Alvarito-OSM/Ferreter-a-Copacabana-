export interface Proveedor {
  idProveedor?: number;
  razonSocial: string;
  nit: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estado?: boolean;
}
