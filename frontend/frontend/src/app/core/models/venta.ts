export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
}

export interface VentaRequest {
  idCliente: number;
  idEmpleado: number;
  detalles: DetalleVentaRequest[];
}

export interface Venta {
  idVenta: number;
  idCliente: number;
  idEmpleado: number;
  fecha: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  estado: string;
}
