import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginRequest {
  usuario: string;
  contrasena: string;
}

interface LoginResponse {
  token: string;
  usuario: string;
  rol: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = '/api/auth';
  private readonly TOKEN_KEY = 'ferreteria_token';
  private readonly USER_KEY = 'ferreteria_usuario';
  private readonly ROL_KEY = 'ferreteria_rol';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, response.usuario);
          localStorage.setItem(this.ROL_KEY, response.rol);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROL_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsuario(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  getRol(): string | null {
    return localStorage.getItem(this.ROL_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdministrador(): boolean {
    return this.getRol() === 'ROLE_ADMINISTRADOR';
  }

  isEmpleado(): boolean {
    return this.getRol() === 'ROLE_EMPLEADO';
  }
}
