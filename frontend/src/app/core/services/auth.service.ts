import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

/**
 * Servicio de autenticación para TaskFlow Pro.
 * Maneja login, registro y gestión de sesión.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Señales reactivas para el estado del usuario
  currentUser = signal<AuthResponse | null>(this.loadUserFromStorage());

  /**
   * Inicia sesión con email y contraseña.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Registra un nuevo usuario.
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  /**
   * Cierra la sesión actual.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  /**
   * Maneja la respuesta de autenticación exitosa.
   */
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    this.currentUser.set(response);
  }

  /**
   * Carga el usuario desde localStorage.
   */
  private loadUserFromStorage(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Obtiene el token JWT actual.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verifica si hay una sesión activa.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene el nombre completo del usuario.
   */
  getFullName(): string {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}
