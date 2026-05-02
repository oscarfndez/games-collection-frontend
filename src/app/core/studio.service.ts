import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponseDto } from './game.service';

export interface StudioDto {
  id?: string;
  name: string;
  description: string;
  location: string;
  first_party?: boolean | null;
  game_ids?: string[];
  game_names?: string[];
  games_count?: number;
}

@Injectable({ providedIn: 'root' })
export class StudioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/studio`;

  getAll(
    search?: string,
    sortField?: string,
    sortDir?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponseDto<StudioDto>> {
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

    return this.http.get<PageResponseDto<StudioDto>>(`${this.baseUrl}/all`, { params });
  }

  getById(id: string): Observable<StudioDto> {
    const params = new HttpParams().set('id', id);
    return this.http.get<StudioDto>(this.baseUrl, { params });
  }

  create(studio: StudioDto): Observable<StudioDto> {
    return this.http.post<StudioDto>(this.baseUrl, studio);
  }

  update(id: string, studio: StudioDto): Observable<StudioDto> {
    const params = new HttpParams().set('id', id);
    return this.http.put<StudioDto>(this.baseUrl, studio, { params });
  }

  delete(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}
