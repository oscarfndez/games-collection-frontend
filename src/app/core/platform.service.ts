import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface PageResponseDto<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/platform`;

getAll(
  search?: string,
  sortField?: string,
  sortDir?: string,
  page: number = 0,
  size: number = 10
): Observable<PageResponseDto<PlatformDto>> {
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

  return this.http.get<PageResponseDto<PlatformDto>>(`${this.baseUrl}/all`, { params });
}

  getById(id: string): Observable<PlatformDto> {
    const params = new HttpParams().set('id', id);
    return this.http.get<PlatformDto>(this.baseUrl, { params });
  }

  create(platform: PlatformDto): Observable<PlatformDto> {
    return this.http.post<PlatformDto>(this.baseUrl, platform);
  }

  update(id: string, platform: PlatformDto): Observable<PlatformDto> {
    const params = new HttpParams().set('id', id);
    return this.http.put<PlatformDto>(this.baseUrl, platform, { params });
  }

  delete(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(this.baseUrl, { params });
  }
}