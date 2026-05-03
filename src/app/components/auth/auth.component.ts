import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Tab = 'login' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Stars layer -->
    <div class="stars-layer" aria-hidden="true"></div>

    <div class="auth-page">

      <!-- Card -->
      <div class="glass-panel auth-card animate-fade-in">

        <!-- Tabs -->
        <div class="auth-tabs" role="tablist">
          <button
            id="tab-login"
            role="tab"
            class="auth-tab"
            [class.auth-tab--active]="tab() === 'login'"
            (click)="tab.set('login'); clearError()"
          >Connexion</button>
          <button
            id="tab-register"
            role="tab"
            class="auth-tab"
            [class.auth-tab--active]="tab() === 'register'"
            (click)="tab.set('register'); clearError()"
          >Inscription</button>
        </div>

        <!-- Error -->
        @if (errorMsg()) {
          <div class="auth-error animate-fade-in" role="alert">
            ⚠️ {{ errorMsg() }}
          </div>
        }

        <!-- Login form -->
        @if (tab() === 'login') {
          <form class="auth-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
            <div class="auth-field">
              <label for="login-username" class="auth-label">Nom d'utilisateur</label>
              <input
                id="login-username"
                type="text"
                name="username"
                [(ngModel)]="loginUsername"
                class="auth-input"
                placeholder="Votre pseudo"
                autocomplete="username"
                required
              />
            </div>
            <div class="auth-field">
              <label for="login-password" class="auth-label">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                name="password"
                [(ngModel)]="loginPassword"
                class="auth-input"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>
            <button
              id="login-submit"
              type="submit"
              class="auth-btn"
              [disabled]="loading()"
            >
              @if (loading()) { Connexion… } @else { Se connecter → }
            </button>
          </form>
        }

        <!-- Register form -->
        @if (tab() === 'register') {
          <form class="auth-form" (ngSubmit)="onRegister()" #registerForm="ngForm">
            <div class="auth-field">
              <label for="reg-username" class="auth-label">Nom d'utilisateur</label>
              <input
                id="reg-username"
                type="text"
                name="username"
                [(ngModel)]="regUsername"
                class="auth-input"
                placeholder="Min. 3 caractères"
                autocomplete="username"
                required
                minlength="3"
              />
            </div>
            <div class="auth-field">
              <label for="reg-password" class="auth-label">Mot de passe</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                [(ngModel)]="regPassword"
                class="auth-input"
                placeholder="Min. 6 caractères"
                autocomplete="new-password"
                required
                minlength="6"
              />
            </div>
            <button
              id="register-submit"
              type="submit"
              class="auth-btn"
              [disabled]="loading()"
            >
              @if (loading()) { Création… } @else { Créer mon compte → }
            </button>
          </form>
        }

      </div>

      <!-- Footer -->
      <footer class="auth-footer">
        Données fournies par
        <a href="https://tcgdex.dev" target="_blank" rel="noopener">TCGdex</a>
      </footer>
    </div>
  `,
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  tab     = signal<Tab>('login');
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  // Login fields
  loginUsername = '';
  loginPassword = '';

  // Register fields
  regUsername = '';
  regPassword = '';

  clearError(): void {
    this.errorMsg.set(null);
  }

  onLogin(): void {
    if (!this.loginUsername || !this.loginPassword) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.loginUsername, this.loginPassword).subscribe({
      next:  () => this.router.navigateByUrl('/'),
      error: err => {
        this.errorMsg.set(err.error?.error ?? 'Erreur de connexion.');
        this.loading.set(false);
      },
    });
  }

  onRegister(): void {
    if (!this.regUsername || !this.regPassword) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    this.authService.register(this.regUsername, this.regPassword).subscribe({
      next:  () => this.router.navigateByUrl('/'),
      error: err => {
        this.errorMsg.set(err.error?.error ?? 'Erreur lors de l\'inscription.');
        this.loading.set(false);
      },
    });
  }
}
