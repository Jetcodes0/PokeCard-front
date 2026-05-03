import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base  = 'http://localhost:3000/api/auth';

  // ── State ──────────────────────────────────────────────────────
  currentUser      = signal<User | null>(null);
  isAuthenticated  = computed(() => !!this.currentUser());

  // ── Check existing session on app startup ──────────────────────
  checkSession(): Observable<User> {
    return this.http
      .get<User>(`${this.base}/me`, { withCredentials: true })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  // ── Register ───────────────────────────────────────────────────
  register(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.base}/register`, { username, password }, { withCredentials: true })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  // ── Login ──────────────────────────────────────────────────────
  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.base}/login`, { username, password }, { withCredentials: true })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  // ── Logout ─────────────────────────────────────────────────────
  logout(): Observable<{ ok: boolean }> {
    return this.http
      .post<{ ok: boolean }>(`${this.base}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUser.set(null)));
  }
}
