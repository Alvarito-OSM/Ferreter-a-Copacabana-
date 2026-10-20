export interface Producto {
  idProducto?: number;
  codigoBarras: string;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  estado: boolean;
  imagenUrl?: string; // <-- LA IMAGEN VA AQUÍ ADENTRO
  categoria?: {
    idCategoria: number;
    nombre?: string;
  };
  administrador?: {
    idAdministrador: number;
  };
}
