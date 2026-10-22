import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Layout } from '../../layout/layout';
import { UserService } from '../../services/user';
import { ReportService, ReportModel } from '../../services/report';
import {
  NotificationService,
  NotificationModel
} from '../../services/notification.service';

import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'app-industry-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Layout],
  templateUrl: './industry-manager-dashboard.html',
  styleUrl: './industry-manager-dashboard.css'
})
export class IndustryManagerDashboard implements OnInit, OnDestroy {

  managerName = '';

  // ============================================================
  // ASSIGNED INDUSTRY (from the database)
  // ============================================================
  industryName = 'Not yet assigned';
  private industryId: number | null = null;

  // ============================================================
  // DASHBOARD VALUES
  // ============================================================
  complianceStatus = '—';
  activeViolations = 0;
  riskLevel = '—';

  compliantPercent = 0;
  needsAttentionPercent = 0;
  highRiskPercent = 0;

  lowRiskPercent = 0;
  mediumRiskPercent = 0;
  highRiskClassPercent = 0;

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  notifications: NotificationModel[] = [];
  showNotificationPanel = false;

  // Checks assignment, notifications and reports every 3 seconds
  private refreshSubscription?: Subscription;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }


  // ============================================================
  // INITIALIZE DASHBOARD
  // ============================================================
  ngOnInit(): void {

    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      console.error('No logged-in user found.');
      return;
    }

    let user: any;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error('Invalid currentUser data:', error);
      return;
    }

    this.managerName = user.fullName || user.username || 'Manager';

    // Notifications are loaded inside loadManagerData,
    // once the industry id is known.
    this.loadManagerData(user.id);

    // Every 3 seconds: re-check the assignment, refresh notifications
    // and refresh the report statistics.
    this.refreshSubscription = interval(3000).subscribe(() => {
      this.checkAssignedIndustry(user.id);
      this.loadNotifications();

      if (this.industryId !== null) {
        this.loadIndustryReports(this.industryId);
      }
    });
  }


  // ============================================================
  // LOAD MANAGER DATA
  // ============================================================
  loadManagerData(userId: number): void {

    this.userService.getUser(userId).subscribe({

      next: (data: any) => {

        console.log('Manager user data:', data);

        this.industryName = data.assignedIndustryName || 'Not yet assigned';
        this.industryId = data.assignedIndustryId ?? null;

        console.log('Assigned Industry ID:', this.industryId);
        console.log('Assigned Industry Name:', this.industryName);

        if (this.industryId !== null) {
          this.loadIndustryReports(this.industryId);
        } else {
          console.warn('This manager has no assigned industry.');
        }

        // Industry is known now, so load its notifications
        this.loadNotifications();

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load manager:', err);

        this.industryName = 'Not yet assigned';
        this.industryId = null;

        this.cdr.detectChanges();
      }
    });
  }


  // ============================================================
  // CHECK WHETHER ADMIN CHANGED THE INDUSTRY
  // ============================================================
  checkAssignedIndustry(userId: number): void {

    this.userService.getUser(userId).subscribe({

      next: (data: any) => {

        const newIndustryId = data.assignedIndustryId ?? null;
        const newIndustryName = data.assignedIndustryName || 'Not yet assigned';

        if (newIndustryId !== this.industryId) {

          console.log('Industry assignment changed.');
          console.log('Old industry:', this.industryName);
          console.log('New industry:', newIndustryName);

          this.industryId = newIndustryId;
          this.industryName = newIndustryName;

          // Clear the old industry's data and notifications
          this.resetReportData();
          this.notifications = [];

          if (this.industryId !== null) {
            this.loadIndustryReports(this.industryId);
            this.loadNotifications();
          }

          this.cdr.detectChanges();
        }
      },

      error: (err) => {
        console.error('Failed to check industry assignment:', err);
      }
    });
  }


  // ============================================================
  // LOAD REPORTS FOR THE ASSIGNED INDUSTRY
  // ============================================================
  loadIndustryReports(industryId: number): void {

    this.reportService.getReportsForIndustry(industryId).subscribe({

      next: (reports: ReportModel[]) => {

        if (!reports || reports.length === 0) {
          this.resetReportData();
          this.cdr.detectChanges();
          return;
        }

        // Most recent report (the API returns newest first)
        const latest = reports[0];

        this.complianceStatus = latest.complianceStatus;
        this.activeViolations = latest.activeViolations;
        this.riskLevel = latest.riskLevel;

        const total = reports.length;

        const percent = (count: number) => Math.round((count / total) * 100);

        this.compliantPercent = percent(
          reports.filter(r => r.complianceStatus === 'Compliant').length);

        this.needsAttentionPercent = percent(
          reports.filter(r => r.complianceStatus === 'Under Review').length);

        this.highRiskPercent = percent(
          reports.filter(r => r.complianceStatus === 'Non-Compliant').length);

        this.lowRiskPercent = percent(
          reports.filter(r => r.riskLevel === 'Low').length);

        this.mediumRiskPercent = percent(
          reports.filter(r => r.riskLevel === 'Medium').length);

        this.highRiskClassPercent = percent(
          reports.filter(r => r.riskLevel === 'High').length);

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load reports:', err);
      }
    });
  }


  // ============================================================
  // RESET REPORT DATA
  // ============================================================
  resetReportData(): void {
    this.complianceStatus = '—';
    this.activeViolations = 0;
    this.riskLevel = '—';

    this.compliantPercent = 0;
    this.needsAttentionPercent = 0;
    this.highRiskPercent = 0;

    this.lowRiskPercent = 0;
    this.mediumRiskPercent = 0;
    this.highRiskClassPercent = 0;
  }


  // ============================================================
  // NOTIFICATIONS (only for the manager's assigned industry)
  // ============================================================
  loadNotifications(): void {

    if (this.industryId === null) {
      this.notifications = [];
      this.cdr.detectChanges();
      return;
    }

    this.notificationService
      .getNotificationsForIndustry(this.industryId)
      .subscribe({

        next: (data) => {
          this.notifications = data;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Failed to load notifications:', err);
        }
      });
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  markNotificationRead(n: NotificationModel): void {

    if (n.isRead) {
      return;
    }

    this.notificationService.markAsRead(n.id).subscribe({

      next: () => {
        n.isRead = true;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  markAllRead(): void {

    if (this.industryId === null) {
      return;
    }

    this.notificationService
      .markAllAsReadForIndustry(this.industryId)
      .subscribe({

        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Failed to mark all as read:', err);
        }
      });
  }


  // ============================================================
  // NAVIGATION
  // ============================================================
  goToEnvironmentalData(): void {
    this.router.navigate(['/environmental-data']);
  }

  goToRiskPrediction(): void {
    this.router.navigate(['/risk-prediction']);
  }

  goToRecommendations(): void {
    this.router.navigate(['/recommendations']);
  }


  // ============================================================
  // DESTROY COMPONENT
  // ============================================================
  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }
}
