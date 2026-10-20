import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = '/api/inventario';

  constructor(private http: HttpClient) { }

  crearInventario(inventario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, inventario);
  }

  obtenerInventarioPorProducto(idProducto: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/producto/${idProducto}`);
  }

  listarInventario(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  actualizarInventario(id: number, inventario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, inventario);
  }
}
