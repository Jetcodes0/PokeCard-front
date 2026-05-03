import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tries-indicator',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-3 my-5">
      <!-- Pip dots -->
      <div class="flex items-center gap-2">
        @for (i of allTries; track i) {
          <div
            class="try-pip"
            [class.active]="i <= triesLeft()"
            [class.used]="i > triesLeft()"
          ></div>
        }
      </div>
      <!-- Label -->
      <p class="text-xs font-body" [class]="labelClass()">
        @if (triesLeft() > 0) {
          {{ triesLeft() }} essai{{ triesLeft() > 1 ? 's' : '' }} restant{{ triesLeft() > 1 ? 's' : '' }}
        } @else {
          Plus d'essais !
        }
      </p>
    </div>
  `,
})
export class TriesIndicatorComponent {
  triesLeft = input<number>(5);
  readonly allTries = [1, 2, 3, 4, 5];

  labelClass() {
    const t = this.triesLeft();
    if (t <= 1) return 'text-red-400 font-semibold';
    if (t <= 2) return 'text-orange-400';
    return 'text-white/40';
  }
}
