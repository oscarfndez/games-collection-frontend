import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameDto {
  id?: string;
  name: string;
  description: string;
  platform_id: string;
  platform_name: string;

}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/game`;

  getAll(): Observable<GameDto[]> {
    return this.http.get<GameDto[]>(`${this.baseUrl}/all`);
  }

  getById(id: string): Observable<GameDto> {
    const params = new HttpParams().set('id', id);
    return this.http.get<GameDto>(this.baseUrl, { params });
  }

  create(game: GameDto): Observable<GameDto> {
    return this.http.post<GameDto>(this.baseUrl, game);
  }

  update(id: string, game: GameDto): Observable<GameDto> {
    const params = new HttpParams().set('id', id);
    return this.http.put<GameDto>(this.baseUrl, game, { params });
  }

  delete(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}