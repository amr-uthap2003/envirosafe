import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-report-prediction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-prediction.html',
  styleUrl: './report-prediction.css'
})
export class ReportPrediction implements OnInit, OnDestroy {
  data: any = null;
  error = '';
  private sub?: Subscription;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return;

    let managerId: number;
    try { managerId = JSON.parse(stored).id; } catch { return; }

    this.sub = interval(10000).pipe(
      startWith(0),
      switchMap(() => this.http.get<any>(`http://localhost:5180/api/report-prediction/${managerId}`))
    ).subscribe({
      next: d => { this.data = d; this.error = ''; this.cdr.detectChanges(); },
      error: () => { this.error = 'Could not load the report prediction.'; this.cdr.detectChanges(); }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
