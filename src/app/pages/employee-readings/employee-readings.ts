import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer, forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Layout } from '../../layout/layout';
import { UserService } from '../../services/user';
import { ReadingService, EnvironmentalReading } from '../../services/reading.service';

@Component({
  selector: 'app-employee-readings',
  standalone: true,
  imports: [CommonModule, Layout],
  templateUrl: './employee-readings.html',
  styleUrl: './employee-readings.css'
})
export class EmployeeReadings implements OnInit, OnDestroy {

  readings: EnvironmentalReading[] = [];
  loading = true;
  error = '';
  industryName = '';

  private pollSub?: Subscription;

  constructor(
    private userService: UserService,
    private readingService: ReadingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      console.warn('[EmployeeReadings] No currentUser in localStorage.');
      this.loading = false;
      return;
    }
    const user = JSON.parse(storedUser);

    // Every 5 seconds: re-read the manager's CURRENT industry, the users and the readings
    this.pollSub = timer(0, 5000)
      .pipe(
        switchMap(() =>
          forkJoin({
            manager: this.userService.getUser(user.id),
            users: this.userService.getAllUsers(),
            readings: this.readingService.getAllReadings()
          }).pipe(
            catchError((err) => {
              console.error('Failed to refresh readings:', err);
              this.error = 'Failed to load readings.';
              return of(null);
            })
          )
        )
      )
      .subscribe((result: any) => {
        if (result) {
          this.error = '';

          const industryId = Number(result.manager?.assignedIndustryId);
          this.industryName = result.manager?.assignedIndustryName || '';

          if (!industryId) {
            this.readings = [];
          } else {
            const employeeIds = new Set(
              (result.users as any[])
                .filter(u => u.role === 'Employee' &&
                  Number(u.assignedIndustryId) === industryId)
                .map(u => u.id)
            );

            this.readings = (result.readings as any[])
              .filter(r => employeeIds.has(r.submittedByUserId))
              .sort((a, b) =>
                new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          }
        }

        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}
