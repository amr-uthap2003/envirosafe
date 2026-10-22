import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EmployeeLayout } from '../../employee-layout/employee-layout';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeLayout],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard implements OnInit, OnDestroy {

  assignedIndustry = 'Not yet assigned';
  totalSubmissions = 8;
  lastSubmissionDate = 'Today, 9:15 AM';

  industryChangedAlert = '';

  private currentIndustryId: number | null | undefined = undefined;
  private userId: number | null = null;

  private pollIntervalMs = 2000;
  private pollSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    this.userId = user.id;

    this.userService.getUser(user.id).subscribe({
      next: (data) => {
        this.currentIndustryId = data.assignedIndustryId ?? null;
        this.assignedIndustry = data.assignedIndustryName || 'Not yet assigned';
        this.cdr.detectChanges(); // force the view to update
      },
      error: (err) => {
        console.error('Failed to load assigned industry:', err);
      }
    });

    this.pollSubscription = interval(this.pollIntervalMs)
      .pipe(switchMap(() => this.userService.getUser(this.userId!)))
      .subscribe({
        next: (data) => {
          const newIndustryId = data.assignedIndustryId ?? null;
          const newIndustryName = data.assignedIndustryName || 'Not yet assigned';

          if (this.currentIndustryId !== undefined && newIndustryId !== this.currentIndustryId) {
            this.industryChangedAlert = `Your assigned industry was updated to "${newIndustryName}".`;
          }

          this.currentIndustryId = newIndustryId;
          this.assignedIndustry = newIndustryName;
          this.cdr.detectChanges(); // force the view to update
        },
        error: (err) => {
          console.error('Polling error:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  dismissAlert(): void {
    this.industryChangedAlert = '';
    this.cdr.detectChanges();
  }
}
