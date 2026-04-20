import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlatformDto {
  id?: string;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/platform`;

  getAll(): Observable<PlatformDto[]> {
    return this.http.get<PlatformDto[]>(`${this.baseUrl}/all`);
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