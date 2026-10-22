import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer, of, forkJoin } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Layout } from '../../layout/layout';
import { UserService } from '../../services/user';
import { ReportService, ReportModel } from '../../services/report';

@Component({
  selector: 'app-inspector-reports',
  standalone: true,
  imports: [CommonModule, Layout],
  templateUrl: './inspector-reports.html',
  styleUrl: './inspector-reports.css'
})
export class InspectorReports implements OnInit, OnDestroy {

  reports: any[] = [];
  loading = true;
  error = '';

  private pollSub?: Subscription;

  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      this.loading = false;
      return;
    }
    const user = JSON.parse(storedUser);

    // Every 10 seconds: re-read the manager's current industry AND the reports
    this.pollSub = timer(0, 10000)
      .pipe(
        switchMap(() =>
          forkJoin({
            manager: this.userService.getUser(user.id),
            reports: this.reportService.getAllReports()
          }).pipe(
            catchError((err) => {
              console.error('Failed to refresh:', err);
              this.error = 'Failed to load inspector reports.';
              return of(null);
            })
          )
        )
      )
      .subscribe((result: any) => {
        if (result) {
          this.error = '';

          const industryId = Number(result.manager?.assignedIndustryId);
          console.log('manager industry:', industryId, 'all reports:', result.reports);

          this.reports = industryId
            ? (result.reports as ReportModel[])
              .filter((r: any) => Number(r.industryId) === industryId)
              .sort((a, b) =>
                new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
            : [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}
