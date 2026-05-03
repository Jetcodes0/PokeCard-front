import { Component, input, output, OnInit, signal } from '@angular/core';

interface ConfettiPiece {
  id: number; left: number; delay: number; duration: number;
  color: string; width: number; height: number;
}

const COLORS = ['#FFD700','#FF8C00','#DC2626','#3B82F6','#22C55E','#A855F7','#EC4899','#06B6D4'];

@Component({
  selector: 'app-result-banner',
  standalone: true,
  template: `
    <!-- Confetti rain -->
    @if (status() === 'won') {
      @for (p of confetti; track p.id) {
        <div class="confetti-piece"
          [style.left.%]="p.left"
          [style.background]="p.color"
          [style.width.px]="p.width"
          [style.height.px]="p.height"
          [style.animation-duration.s]="p.duration"
          [style.animation-delay.s]="p.delay"
        ></div>
      }
    }

    <!-- Result card -->
    <div class="result-overlay glass-panel w-full max-w-sm mx-auto mt-6 p-8 text-center">
      @if (status() === 'won') {
        <div class="text-5xl mb-4">🎉</div>
        <h2 class="font-pokemon text-yellow-400 text-sm leading-relaxed mb-3 tracking-wider">
          Félicitations !
        </h2>
        <p class="text-white/60 text-sm mb-1">C'était bien</p>
        <p class="text-2xl font-bold text-yellow-400 mt-1">{{ revealedName() }}</p>
      }

      @if (status() === 'lost') {
        <div class="text-5xl mb-4">😔</div>
        <h2 class="font-pokemon text-red-400 text-sm leading-relaxed mb-3 tracking-wider">
          Dommage…
        </h2>
        <p class="text-white/60 text-sm mb-1">C'était</p>
        <p class="text-2xl font-bold text-red-400 mt-1">{{ revealedName() }}</p>
      }

      <button id="replay-btn" (click)="replay.emit()" class="replay-btn mt-7">
        🔄 &nbsp;Nouvelle carte
      </button>
    </div>
  `,
})
export class ResultBannerComponent implements OnInit {
  status      = input<'won' | 'lost'>('won');
  revealedName = input<string | null>(null);
  replay       = output<void>();

  confetti: ConfettiPiece[] = [];

  ngOnInit(): void {
    if (this.status() === 'won') {
      this.confetti = Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left:     Math.random() * 100,
        delay:    Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2.5,
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        width:    7 + Math.floor(Math.random() * 8),
        height:   10 + Math.floor(Math.random() * 12),
      }));
    }
  }
}
