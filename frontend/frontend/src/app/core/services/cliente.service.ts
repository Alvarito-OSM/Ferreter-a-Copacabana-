import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  idCliente?: number;
  nombre: string;
  apellido?: string | null;
  cedulaNit: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  fechaRegistro?: string;
  estado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = '/api/clientes';

  constructor(private readonly http: HttpClient) {}

  listar(busqueda: string = ''): Observable<Cliente[]> {
    const params = new HttpParams().set('q', busqueda.trim());
    return this.http.get<Cliente[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}