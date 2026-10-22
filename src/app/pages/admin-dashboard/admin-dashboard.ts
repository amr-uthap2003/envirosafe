import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminLayout } from '../../admin-layout/admin-layout';
import { ReadingService, EnvironmentalReading } from '../../services/reading.service';
import { NotificationService, NotificationModel } from '../../services/notification.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayout],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {

  totalUsers = 12;
  totalIndustries = 5;
  pendingApprovals = 2;
  activeInspectors = 4;

  notifications: NotificationModel[] = [];
  showNotificationPanel = false;
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  private highestKnownReadingId: number | undefined = undefined;
  private pollIntervalMs = 2000;
  private pollSubscription?: Subscription;

  constructor(
    private readingService: ReadingService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.readingService.getAllReadings().subscribe({
      next: (readings) => {
        this.highestKnownReadingId = this.getMaxId(readings);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load readings:', err)
    });

    this.loadNotifications();

    this.pollSubscription = interval(this.pollIntervalMs)
      .pipe(switchMap(() => this.readingService.getAllReadings()))
      .subscribe({
        next: (readings) => {
          const newMaxId = this.getMaxId(readings);

          if (this.highestKnownReadingId !== undefined && newMaxId !== undefined
            && newMaxId > this.highestKnownReadingId) {
            this.loadNotifications();
          }

          this.highestKnownReadingId = newMaxId ?? this.highestKnownReadingId;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Polling error:', err)
      });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadNotifications(): void {
    this.notificationService.getAllNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load notifications:', err)
    });
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  markNotificationRead(n: NotificationModel): void {
    if (n.isRead) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to mark as read:', err)
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to mark all as read:', err)
    });
  }

  roleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin': return 'badge-admin';
      case 'Inspector': return 'badge-inspector';
      case 'Industry Manager': return 'badge-manager';
      case 'Employee': return 'badge-employee';
      default: return '';
    }
  }

  private getMaxId(readings: { id: number }[]): number | undefined {
    if (!readings || readings.length === 0) return undefined;
    return Math.max(...readings.map(r => r.id));
  }
}
