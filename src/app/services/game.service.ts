import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RandomCardResponse {
  sessionToken: string;
}

export interface GuessResponse {
  success: boolean;
  baseName?: string;
  triesLeft: number;
}

export interface ScoreEntry {
  username: string;
  wins:     number;
  losses:   number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);
  private base  = 'http://localhost:3000/api';

  getRandomCard(): Observable<RandomCardResponse> {
    return this.http.get<RandomCardResponse>(`${this.base}/random-card`, { withCredentials: true });
  }

  /** Returns a Blob URL for the card image. The real TCGdex URL stays server-side. */
  getCardImageBlob(sessionToken: string): Observable<Blob> {
    return this.http.get(`${this.base}/card-image/${sessionToken}`, {
      responseType:    'blob',
      withCredentials: true,
    });
  }

  getPokemonNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/pokemon-names`, { withCredentials: true });
  }

  guess(sessionToken: string, guess: string): Observable<GuessResponse> {
    return this.http.post<GuessResponse>(
      `${this.base}/guess`,
      { sessionToken, guess },
      { withCredentials: true }
    );
  }

  getScoreboard(): Observable<ScoreEntry[]> {
    return this.http.get<ScoreEntry[]>(`${this.base}/scoreboard`, { withCredentials: true });
  }
}
