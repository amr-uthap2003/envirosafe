import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationModel {
  id: number;
  message: string;
  submittedByName: string;
  submittedByRole: string;
  createdAt: string;
  isRead: boolean;
  industryId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:5180/api/Notifications';

  constructor(private http: HttpClient) { }

  getAllNotifications(): Observable<NotificationModel[]> {
    return this.http.get<NotificationModel[]>(this.baseUrl);
  }

  getNotificationsForIndustry(industryId: number): Observable<NotificationModel[]> {
    return this.http.get<NotificationModel[]>(`${this.baseUrl}/industry/${industryId}`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/read-all`, {});
  }

  markAllAsReadForIndustry(industryId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/industry/${industryId}/read-all`, {});
  }
}
