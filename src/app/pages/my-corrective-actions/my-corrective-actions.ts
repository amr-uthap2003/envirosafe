import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

import { EmployeeLayout } from '../../employee-layout/employee-layout';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';

@Component({
  selector: 'app-my-corrective-actions',
  standalone: true,
  imports: [CommonModule, EmployeeLayout, InspectorLayout],
  templateUrl: './my-corrective-actions.html',
  styleUrl: './my-corrective-actions.css'
})
export class MyCorrectiveActions implements OnInit, OnDestroy {
  data: any = null;
  error = '';
  role = '';
  private sub?: Subscription;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  get isInspector(): boolean {
    return this.role.toLowerCase().includes('inspector');
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) { this.error = 'Please log in again.'; return; }

    let userId: number;
    try {
      const u = JSON.parse(stored);
      userId = u.id;
      this.role = u.role || '';
    } catch { this.error = 'Invalid login data. Please log in again.'; return; }

    this.sub = interval(10000).pipe(
      startWith(0),
      switchMap(() => this.http.get<any>(`http://localhost:5180/api/my-corrective/${userId}`))
    ).subscribe({
      next: d => { this.data = d; this.error = ''; this.cdr.detectChanges(); },
      error: e => {
        this.error = typeof e.error === 'string' && e.error ? e.error : 'Could not load corrective actions.';
        this.cdr.detectChanges();
      }
    });
  }

  cls(s: string): string { return (s || 'low').toLowerCase(); }

  actionClass(s: string): string {
    return s === 'Completed' ? 'c-ok' : s === 'In Progress' ? 'c-warn' : 'c-bad';
  }

  isOverdue(a: any): boolean {
    return a.status !== 'Completed' && new Date(a.dueDate).getTime() < Date.now();
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
