import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameDto {
  id?: string;
  name: string;
  description: string;
  platform_id: string;
  platform_name?: string;
  image_url?: string;
}

export interface PageResponseDto<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/game`;

    getAll(
      search?: string,
      sortField?: string,
      sortDir?: string,
      page: number = 0,
      size: number = 10
    ): Observable<PageResponseDto<GameDto>> {
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

      return this.http.get<PageResponseDto<GameDto>>(`${this.baseUrl}/all`, { params });
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