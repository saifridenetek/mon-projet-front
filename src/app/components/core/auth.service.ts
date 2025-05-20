import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'DOCTOR' | 'PATIENT';
}

export interface AuthResponse {
  roles?: string[];
  email: string;
  token: string;
  role?: 'DOCTOR' | 'PATIENT';
  name: string;
  username: string;
  accessToken?: string; // Added to handle both token and accessToken
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: any = null;
  private apiUrl = 'http://localhost:8901/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(loginRequest: {username: string, password: string}): Observable<any> {
    const credentials = {
      username: loginRequest.username,
      password: loginRequest.password
    };
    
    return this.http.post<any>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(response => {
        this.storeAuthData(response);
        this.isLoggedInSubject.next(true);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );
  }

  // In auth.service.ts
private storeAuthData(response: AuthResponse): void {
  const token = response.accessToken || response.token;
  localStorage.setItem('token', token);
  localStorage.setItem('username', response.username || response.name);
  localStorage.setItem('email', response.email);
  localStorage.setItem('name', response.name);
  
  // Store role consistently
  const role = response.role || (response.roles && response.roles[0]);
  if (role) {
    localStorage.setItem('role', role);
  }
  
  this.user = {
    username: response.username || response.name,
    name: response.name,
    email: response.email,
    role: role,
    token: token
  };
}
  signup(userData: RegisterRequest): Observable<RegisterResponse> {
    const request = {
      username: userData.name,
      email: userData.email,
      password: userData.password,
      roles: [userData.role]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log("request signup", request)
    return this.http.post<RegisterResponse>(`${this.apiUrl}/signup`, request, { headers }).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getUsername(): string | null {
    return localStorage.getItem('username') || localStorage.getItem('name');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout(): void {
    localStorage.clear();
    this.user = null;
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/signin']);
  }
}