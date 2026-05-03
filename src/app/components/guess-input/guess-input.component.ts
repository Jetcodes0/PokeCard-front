import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

@Component({
  selector: 'app-guess-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative w-full max-w-md animate-fade-in" [class.shake]="isShaking()">
      <div class="flex gap-3">
        <!-- Input wrapper -->
        <div class="relative flex-1">
          <input
            id="pokemon-guess-input"
            type="text"
            [value]="inputValue()"
            (input)="onInput($event)"
            (keydown.enter)="submitGuess()"
            (keydown.escape)="closeDropdown()"
            (blur)="onBlur()"
            (focus)="dropdownOpen.set(true)"
            placeholder="Tapez un nom de Pokémon…"
            autocomplete="off"
            class="guess-input"
          />

          <!-- Autocomplete dropdown -->
          @if (showDropdown()) {
            <div class="autocomplete-dropdown" role="listbox">
              @for (name of filteredNames(); track name) {
                <div
                  class="autocomplete-item"
                  (mousedown)="selectName(name)"
                  role="option"
                >
                  <span class="text-yellow-400/60 mr-2">▸</span>{{ name }}
                </div>
              } @empty {
                <div class="px-5 py-3 text-white/30 text-sm italic">Aucun résultat</div>
              }
            </div>
          }
        </div>

        <button
          id="submit-guess-btn"
          (click)="submitGuess()"
          [disabled]="!canSubmit()"
          class="submit-btn"
        >
          Valider →
        </button>
      </div>
    </div>
  `,
})
export class GuessInputComponent {
  pokemonNames = input<string[]>([]);
  guess        = output<string>();

  inputValue   = signal('');
  dropdownOpen = signal(false);
  isShaking    = signal(false);

  filteredNames = computed(() => {
    const val = normalize(this.inputValue());
    if (val.length < 2) return [];
    return this.pokemonNames()
      .filter(n => normalize(n).startsWith(val))
      .slice(0, 8);
  });

  showDropdown = computed(() =>
    this.dropdownOpen() && this.filteredNames().length > 0
  );

  canSubmit = computed(() => this.inputValue().trim().length > 0);

  onInput(event: Event): void {
    this.inputValue.set((event.target as HTMLInputElement).value);
    this.dropdownOpen.set(true);
  }

  onBlur(): void {
    // Delay so mousedown on dropdown items fires first
    setTimeout(() => this.dropdownOpen.set(false), 150);
  }

  selectName(name: string): void {
    this.inputValue.set(name);
    this.dropdownOpen.set(false);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  submitGuess(): void {
    const val = this.inputValue().trim();
    if (!val) return;
    this.guess.emit(val);
    this.inputValue.set('');
    this.dropdownOpen.set(false);
  }

  /** Called by parent to trigger the shake animation on wrong answer */
  triggerShake(): void {
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 450);
  }
}
