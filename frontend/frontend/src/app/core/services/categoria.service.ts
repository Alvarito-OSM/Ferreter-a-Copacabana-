
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  idCategoria?: number;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private http = inject(HttpClient);
  private apiUrl = '/api/categorias';

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  buscar(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(
      `${this.apiUrl}/${id}`
    );
  }

  buscarPorNombre(nombre: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(
      `${this.apiUrl}/buscar`,
      { params: { nombre } }
    );
  }

  crear(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(
      `${this.apiUrl}/validado`,
      categoria
    );
  }

  actualizar(
    id: number,
    categoria: Categoria
  ): Observable<Categoria> {
    return this.http.put<Categoria>(
      `${this.apiUrl}/${id}/validado`,
      categoria
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
