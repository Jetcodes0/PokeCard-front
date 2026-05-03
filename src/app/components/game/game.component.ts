import {
  Component, OnInit, signal, computed, inject, viewChild
} from '@angular/core';
import { GameService } from '../../services/game.service';
import { CardDisplayComponent, GameStatus } from '../card-display/card-display.component';
import { GuessInputComponent } from '../guess-input/guess-input.component';
import { TriesIndicatorComponent } from '../tries-indicator/tries-indicator.component';
import { ResultBannerComponent } from '../result-banner/result-banner.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CardDisplayComponent,
    GuessInputComponent,
    TriesIndicatorComponent,
    ResultBannerComponent,
    ScoreboardComponent,
  ],
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  private gameService = inject(GameService);
  private guessInput  = viewChild(GuessInputComponent);

  // ── State ──────────────────────────────────────────────────────
  sessionToken = signal<string | null>(null);
  pokemonNames = signal<string[]>([]);
  triesLeft    = signal<number>(5);          // mirrors server state for display only
  gameStatus   = signal<GameStatus>('loading');
  revealedName = signal<string | null>(null);
  errorMsg     = signal<string | null>(null);

  // ── Derived ────────────────────────────────────────────────────
  /**
   * Blur decreases by 7% of max (20px) per wrong answer.
   * Start: 20px (100%) → after n wrong: 20px × max(0, 100 - n×7) / 100
   * With 10 tries: 20→18.6→17.2→...→7.4px (30% remaining at last try)
   */
  blurAmount = computed<number>(() => {
    if (this.gameStatus() !== 'playing') return 0;
    const used = 5 - this.triesLeft();
    
    // Le floutage diminue à chaque essai (20% de moins par essai utilisé)
    const pct = Math.max(0, 100 - used * 20);
    
    return Math.round(20 * pct / 100);
  });

  blurProgress = computed<number>(() =>
    Math.round(((20 - this.blurAmount()) / 20) * 100)
  );

  resultStatus = computed<'won' | 'lost'>(() =>
    this.gameStatus() === 'won' ? 'won' : 'lost'
  );

  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadNames();
    this.loadNewCard();
  }

  // ── Methods ────────────────────────────────────────────────────
  loadNames(): void {
    this.gameService.getPokemonNames().subscribe({
      next:  names => this.pokemonNames.set(names),
      error: err   => console.error('[PokéCard] Noms non chargés:', err),
    });
  }

  loadNewCard(): void {
    this.gameStatus.set('loading');
    this.sessionToken.set(null);
    this.revealedName.set(null);
    this.errorMsg.set(null);
    this.triesLeft.set(5);

    this.gameService.getRandomCard().subscribe({
      next:  data => {
        this.sessionToken.set(data.sessionToken);
        this.gameStatus.set('playing');
      },
      error: () => {
        this.errorMsg.set('Impossible de charger une carte. Le backend est-il démarré ?');
        this.gameStatus.set('playing');
      },
    });
  }

  onGuess(guessValue: string): void {
    if (this.gameStatus() !== 'playing' || !this.sessionToken()) return;

    this.gameService.guess(this.sessionToken()!, guessValue).subscribe({
      next: result => {
        if (result.success) {
          this.revealedName.set(result.baseName ?? guessValue);
          this.triesLeft.set(0);
          this.gameStatus.set('won');
        } else {
          // triesLeft is now authoritative from server
          this.triesLeft.set(result.triesLeft);
          this.guessInput()?.triggerShake();

          if (result.triesLeft <= 0) {
            this.revealedName.set(result.baseName ?? '???');
            this.gameStatus.set('lost');
          }
        }
      },
      error: (err) => {
        const msg = err.error?.error ?? 'Erreur réseau. Réessayez.';
        this.errorMsg.set(msg);
      },
    });
  }

  replay(): void {
    this.loadNewCard();
  }
}
