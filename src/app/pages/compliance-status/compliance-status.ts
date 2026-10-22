import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

import { Layout } from '../../layout/layout';

@Component({
  selector: 'app-compliance-status',
  standalone: true,
  imports: [CommonModule, Layout],
  templateUrl: './compliance-status.html',
  styleUrl: './compliance-status.css'
})
export class ComplianceStatus implements OnInit, OnDestroy {
  industryName = '';
  readings: any[] = [];
  inspections: any[] = [];
  error = '';
  private sub?: Subscription;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      this.error = 'Could not find the logged-in user. Please log in again.';
      return;
    }

    let managerId: number;
    try {
      managerId = JSON.parse(stored).id;
    } catch {
      this.error = 'Invalid login data. Please log in again.';
      return;
    }

    this.sub = interval(10000).pipe(
      startWith(0),
      switchMap(() =>
        this.http.get<any>(`http://localhost:5180/api/industry-manager/${managerId}/reports`))
    ).subscribe({
      next: d => {
        this.industryName = d.industryName;
        this.readings = (d.employeeReadings || []).map((r: any) => {
          const problems = this.checkReading(r);
          return { ...r, status: problems.length ? 'Improper' : 'Proper', problems };
        });
        this.inspections = d.inspectorReports || [];
        this.error = '';
        this.cdr.detectChanges();
      },
      error: e => {
        this.error = typeof e.error === 'string' ? e.error : 'Could not load compliance status.';
        this.cdr.detectChanges();
      }
    });
  }

  // Change these limits if your Compliance Standards page uses different values
  private checkReading(r: any): string[] {
    const p: string[] = [];
    if (r.airQuality > 100) p.push(`Air quality ${r.airQuality}`);
    if (r.waterPh < 6.5 || r.waterPh > 8.5) p.push(`Water pH ${r.waterPh}`);
    if (r.noiseLevel > 75) p.push(`Noise ${r.noiseLevel} dB`);
    if (r.temperature > 40) p.push(`Temperature ${r.temperature}°C`);
    if (r.wasteDisposal === 'Improper') p.push('Improper waste disposal');
    return p;
  }

  get properCount() { return this.readings.filter(r => r.status === 'Proper').length; }
  get improperCount() { return this.readings.filter(r => r.status === 'Improper').length; }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
