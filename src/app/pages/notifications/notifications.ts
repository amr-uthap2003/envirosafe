import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

import { Layout } from '../../layout/layout';
import { UserService } from '../../services/user';
import { NotificationService, NotificationModel } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, Layout],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {

  notifications: NotificationModel[] = [];
  filter: 'all' | 'unread' = 'all';
  industryName = '';
  error = '';

  private industryId: number | null = null;
  private userId = 0;
  private sub?: Subscription;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get visible(): NotificationModel[] {
    return this.filter === 'unread'
      ? this.notifications.filter(n => !n.isRead)
      : this.notifications;
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) { this.error = 'Please log in again.'; return; }

    try { this.userId = JSON.parse(stored).id; }
    catch { this.error = 'Invalid login data. Please log in again.'; return; }

    this.loadManager();

    // Check for new notifications every 5 seconds
    this.sub = interval(5000).subscribe(() => this.loadManager());
  }

  // Gets the manager's assigned industry, then that industry's notifications
  private loadManager(): void {
    this.userService.getUser(this.userId).subscribe({
      next: (data: any) => {
        this.industryId = data.assignedIndustryId ?? null;
        this.industryName = data.assignedIndustryName || '';
        this.loadNotifications();
      },
      error: () => {
        this.error = 'Could not load your account.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadNotifications(): void {
    if (this.industryId === null) {
      this.notifications = [];
      this.cdr.detectChanges();
      return;
    }

    this.notificationService.getNotificationsForIndustry(this.industryId).subscribe({
      next: data => {
        // newest first
        this.notifications = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load notifications.';
        this.cdr.detectChanges();
      }
    });
  }

  markRead(n: NotificationModel): void {
    if (n.isRead) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => { n.isRead = true; this.cdr.detectChanges(); }
    });
  }

  markAllRead(): void {
    if (this.industryId === null) return;
    this.notificationService.markAllAsReadForIndustry(this.industryId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
