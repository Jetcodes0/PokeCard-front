import {
  Component, input, computed, signal, effect,
  ElementRef, viewChild, inject, OnDestroy,
} from '@angular/core';
import { GameService } from '../../services/game.service';

export type GameStatus = 'loading' | 'playing' | 'won' | 'lost';

@Component({
  selector: 'app-card-display',
  standalone: true,
  template: `
    <div class="card-showcase">
      @if (hasError()) {
        <!-- Error placeholder -->
        <div
          class="flex items-center justify-center rounded-[14px] bg-white/5 border border-white/10"
          style="width:260px;height:364px;"
        >
          <div class="text-center">
            <div class="text-6xl mb-3 opacity-20">!</div>
            <p class="text-white/20 text-xs font-body">Erreur de chargement</p>
          </div>
        </div>
      } @else if (!sessionToken() || isLoadingImage()) {
        <!-- Skeleton placeholder -->
        <div
          class="flex items-center justify-center rounded-[14px] bg-white/5 border border-white/10"
          style="width:260px;height:364px;"
        >
          <div class="text-center">
            <div class="text-6xl mb-3 opacity-20">?</div>
            <p class="text-white/20 text-xs font-body">Chargement…</p>
          </div>
        </div>
      } @else {
        <!--
          Canvas renders the card image with blur applied via Canvas API.
          No <img src> is ever exposed in the DOM — the source URL stays server-side.
          The canvas element itself does not expose the original URL.
        -->
        <canvas
          #cardCanvas
          class="pokemon-card-canvas"
          [class]="canvasClass()"
          width="260"
          height="364"
          aria-label="Carte Pokémon mystère"
        ></canvas>
      }
    </div>
  `,
})
export class CardDisplayComponent implements OnDestroy {
  // Signal-based inputs (Angular 17+)
  sessionToken = input<string | null>(null);
  blurAmount   = input<number>(20);
  status       = input<GameStatus>('playing');

  private gameService = inject(GameService);
  private canvas      = viewChild<ElementRef<HTMLCanvasElement>>('cardCanvas');

  hasError       = signal(false);
  isLoadingImage = signal(false);

  private currentBlobUrl: string | null = null;
  private loadedImage: HTMLImageElement | null = null;

  constructor() {
    // Whenever the sessionToken changes, fetch the new image blob
    effect(() => {
      const token = this.sessionToken();
      this.hasError.set(false);
      this.loadedImage = null;

      if (!token) return;

      this.isLoadingImage.set(true);
      this.revokeBlobUrl();

      this.gameService.getCardImageBlob(token).subscribe({
        next: blob => {
          this.currentBlobUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            this.loadedImage = img;
            this.isLoadingImage.set(false);
            this.drawCanvas();
          };
          img.onerror = () => {
            this.hasError.set(true);
            this.isLoadingImage.set(false);
          };
          img.src = this.currentBlobUrl;
        },
        error: () => {
          this.hasError.set(true);
          this.isLoadingImage.set(false);
        },
      });
    });

    // Whenever blur amount or status changes, redraw
    effect(() => {
      this.blurAmount();
      this.status();
      this.drawCanvas();
    });
  }

  canvasClass = computed(() => {
    const s = this.status();
    if (s === 'won')  return 'pokemon-card-canvas status-won';
    if (s === 'lost') return 'pokemon-card-canvas status-lost';
    return 'pokemon-card-canvas';
  });

  private drawCanvas(): void {
    const canvasEl = this.canvas()?.nativeElement;
    const img      = this.loadedImage;

    if (!canvasEl || !img) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const s = this.status();
    const blur = (s === 'won' || s === 'lost') ? 0 : this.blurAmount();

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';

    // Draw with slight padding so blur doesn't clip at edges
    const pad = blur > 0 ? Math.ceil(blur * 1.5) : 0;
    ctx.drawImage(img, -pad, -pad, canvasEl.width + pad * 2, canvasEl.height + pad * 2);
    ctx.filter = 'none';
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl();
  }

  private revokeBlobUrl(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
