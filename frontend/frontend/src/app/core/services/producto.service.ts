
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  idProducto?: number;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  estado: boolean;
  categoria: {
    idCategoria: number;
    nombre?: string;
  };
  administrador?: {
    idAdministrador: number;
  };
  fechaCreacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private http = inject(HttpClient);
  private apiUrl = '/api/productos';

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  buscar(id: number): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`
    );
  }

  buscarPorNombre(nombre: string): Observable<Producto[]> {
    const params = new HttpParams().set('nombre', nombre);

    return this.http.get<Producto[]>(
      `${this.apiUrl}/buscar`,
      { params }
    );
  }

  buscarPorCategoria(id: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(
      `${this.apiUrl}/categoria/${id}`
    );
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(
      `${this.apiUrl}/validado`,
      producto
    );
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(
      `${this.apiUrl}/${id}/validado`,
      producto
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
