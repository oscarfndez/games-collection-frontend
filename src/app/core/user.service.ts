import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponseDto } from './game.service';

export interface WhoAmI {
  id: string;
  email: string;
  role: string;
}

export interface UserDto {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api`;

  whoAmI(): Observable<WhoAmI> {
    return this.http.get<WhoAmI>(`${this.baseUrl}/whoami`);
  }

  getAll(
    search?: string,
    sortField?: string,
    sortDir?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponseDto<UserDto>> {
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

    return this.http.get<PageResponseDto<UserDto>>(`${this.baseUrl}/users/all`, { params });
  }

  getById(id: string): Observable<UserDto> {
    const params = new HttpParams().set('id', id);
    return this.http.get<UserDto>(`${this.baseUrl}/users`, { params });
  }

  update(id: string, user: UserDto): Observable<UserDto> {
    const params = new HttpParams().set('id', id);
    return this.http.put<UserDto>(`${this.baseUrl}/users`, user, { params });
  }

  delete(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<void>(`${this.baseUrl}/users`, { params });
  }
}
