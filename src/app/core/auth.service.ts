import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SigninRequest {
  email: string;
  password: string;
}

export interface JwtAuthenticationResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'auth_token';
  private readonly authenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  readonly authenticated$ = this.authenticatedSubject.asObservable();

  signin(request: SigninRequest): Observable<JwtAuthenticationResponse> {
    return this.http.post<JwtAuthenticationResponse>(
      `${environment.apiBaseUrl}/api/v1/auth/signin`,
      request
    ).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.authenticatedSubject.next(true);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authenticatedSubject.next(false);
  }
}
