import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, VentaRequest } from '../models/venta';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly apiUrl = '/api/ventas';

  constructor(private readonly http: HttpClient) {}

  registrar(venta: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  listar(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }
}
