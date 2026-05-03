import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Logout notch (top-right) -->
    @if (authService.isAuthenticated()) {
      <div class="logout-notch">
        <button id="nav-logout-btn" class="logout-notch-btn" (click)="logout()" title="Déconnexion">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Déco</span>
        </button>
      </div>
    }

    <!-- Routed page content -->
    <router-outlet />
  `,
})
export class App implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Restore session from HttpOnly cookie on page load
    this.authService.checkSession().subscribe({
      error: () => {
        // Not authenticated — router guard will redirect if needed
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
