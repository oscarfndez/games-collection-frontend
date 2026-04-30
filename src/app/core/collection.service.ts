import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponseDto } from './game.service';

export interface GameItemDto {
  id?: string;
  user_id?: string;
  game_id: string;
  game_name?: string;
  game_image_url?: string;
  platform_id: string;
  platform_name?: string;
}

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/collection`;

  getMine(
    search?: string,
    sortField?: string,
    sortDir?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponseDto<GameItemDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (sortField) {
      params = params.set('sortField', sortField);
    }

    if (sortDir) {
      params = params.set('sortDir', sortDir);
    }

    return this.http.get<PageResponseDto<GameItemDto>>(this.baseUrl, { params });
  }

  add(gameItem: GameItemDto): Observable<GameItemDto> {
    return this.http.post<GameItemDto>(this.baseUrl, gameItem);
  }

  update(id: string, gameItem: GameItemDto): Observable<GameItemDto> {
    const params = new HttpParams().set('id', id);
    return this.http.put<GameItemDto>(this.baseUrl, gameItem, { params });
  }

  delete(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}
