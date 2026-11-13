import { Proveedor } from './proveedor';

export interface CompraProveedor {
  idCompra: number;
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
}

export interface ProductoSuministrado {
  idProducto: number;
  nombre: string;
  codigoBarras: string;
  unidadesCompradas: number;
  ultimoPrecio: number;
  ultimaCompra: string;
}

export interface ProveedorResumen {
  proveedor: Proveedor;
  totalCompras: number;
  totalGastado: number;
  ultimaCompra: string | null;
  compras: CompraProveedor[];
  productos: ProductoSuministrado[];
}
