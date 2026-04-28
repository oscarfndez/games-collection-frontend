import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameItemDto {
  id?: string;
  user_id?: string;
  game_id: string;
  game_name?: string;
  platform_id: string;
  platform_name?: string;
}

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/collection`;

  getMine(): Observable<GameItemDto[]> {
    return this.http.get<GameItemDto[]>(this.baseUrl);
  }

  add(gameItem: GameItemDto): Observable<GameItemDto> {
    return this.http.post<GameItemDto>(this.baseUrl, gameItem);
  }

  delete(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}
