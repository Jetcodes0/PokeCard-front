import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GameService, ScoreEntry } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  template: `
    <div class="sb-panel">

      <!-- Header -->
      <div class="sb-header">
        <div class="sb-header-left">
          <span class="sb-trophy-icon">🏆</span>
          <span class="sb-title-text">Classement</span>
        </div>
        <div class="sb-live-dot" [class.sb-live-dot--active]="!loading()" title="Actualisé toutes les 30s"></div>
      </div>

      <!-- Separator -->
      <div class="sb-separator"></div>

      <!-- Empty state -->
      @if (entries().length === 0) {
        <div class="sb-empty">
          @if (loading()) {
            <div class="sb-spinner"></div>
          } @else {
            <p class="sb-empty-text">Aucune partie jouée</p>
            <p class="sb-empty-sub">Soyez le premier ! ✨</p>
          }
        </div>
      }

      <!-- Entries list -->
      @if (entries().length > 0) {
        <ul class="sb-list">
          @for (entry of entries(); track entry.username; let i = $index) {
            <li
              class="sb-item"
              [class.sb-item--me]="entry.username === currentUsernameStr"
              [class.sb-item--gold]="i === 0"
              [class.sb-item--silver]="i === 1"
              [class.sb-item--bronze]="i === 2"
            >
              <!-- Rank medal -->
              <div class="sb-rank">
                @if (i === 0) { <span class="sb-medal">🥇</span> }
                @else if (i === 1) { <span class="sb-medal">🥈</span> }
                @else if (i === 2) { <span class="sb-medal">🥉</span> }
                @else { <span class="sb-rank-num">{{ i + 1 }}</span> }
              </div>

              <!-- Name + win rate bar -->
              <div class="sb-info">
                <div class="sb-name-row">
                  <span class="sb-username">{{ entry.username }}</span>
                  @if (entry.username === currentUsernameStr) {
                    <span class="sb-you-pill">vous</span>
                  }
                </div>
                <div class="sb-bar-track">
                  <div
                    class="sb-bar-fill"
                    [style.width.%]="getWinRate(entry)"
                    [class.sb-bar-fill--high]="getWinRate(entry) >= 70"
                    [class.sb-bar-fill--mid]="getWinRate(entry) >= 40 && getWinRate(entry) < 70"
                    [class.sb-bar-fill--low]="getWinRate(entry) < 40"
                  ></div>
                </div>
              </div>

              <!-- Stats -->
              <div class="sb-stats">
                <div class="sb-wins">{{ entry.wins }}<span class="sb-wins-label">V</span></div>
                <div class="sb-rate" [class.sb-rate--high]="getWinRate(entry) >= 60">
                  {{ getWinRate(entry) }}%
                </div>
              </div>

            </li>
          }
        </ul>
      }

      <!-- Footer note -->
      <div class="sb-footer">Mis à jour toutes les 30s</div>
    </div>
  `,
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  private gameService = inject(GameService);
  private authService = inject(AuthService);

  entries  = signal<ScoreEntry[]>([]);
  loading  = signal(false);

  get currentUsernameStr(): string | undefined {
    return this.authService.currentUser()?.username;
  }

  getWinRate(entry: ScoreEntry): number {
    const total = entry.wins + entry.losses;
    return total === 0 ? 0 : Math.round((entry.wins / total) * 100);
  }

  private pollSub?: Subscription;

  ngOnInit(): void {
    this.fetchScoreboard();
    this.pollSub = interval(30_000)
      .pipe(switchMap(() => this.gameService.getScoreboard()))
      .subscribe({ next: rows => this.entries.set(rows), error: () => {} });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private fetchScoreboard(): void {
    this.loading.set(true);
    this.gameService.getScoreboard().subscribe({
      next:  rows => { this.entries.set(rows); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }
}
