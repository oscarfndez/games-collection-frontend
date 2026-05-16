import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponseDto } from './game.service';

export interface NotificationDto {
  id: string;
  notificationId: string;
  type: string;
  titleKey: string;
  messageKey: string;
  paramsJson: string;
  sourceService: string;
  sourceEntityType: string;
  sourceEntityId: string;
  sourceEntityName?: string;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface UnreadCountDto {
  unread: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/notifications`;

  getUnreadCount(userId: string): Observable<UnreadCountDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<UnreadCountDto>(`${this.baseUrl}/unread-count`, { params });
  }

  getForUser(userId: string, page: number = 0, size: number = 10): Observable<PageResponseDto<NotificationDto>> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponseDto<NotificationDto>>(this.baseUrl, { params });
  }

  markAsRead(id: string, userId: string): Observable<NotificationDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.patch<NotificationDto>(`${this.baseUrl}/${id}/read`, {}, { params });
  }
}
