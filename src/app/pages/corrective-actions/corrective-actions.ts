import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, forkJoin, timer, timeout, finalize } from 'rxjs';

import { Layout } from '../../layout/layout';

@Component({
  selector: 'app-corrective-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './corrective-actions.html',
  styleUrl: './corrective-actions.css'
})
export class CorrectiveActions implements OnInit, OnDestroy {

  private api = 'http://localhost:5180/api';
  private sub?: Subscription;

  managerId = 0;
  info: any = null;
  actions: any[] = [];
  suggestions: any = { count: 0, reports: [] };
  error = '';
  message = '';
  saving = false;

  // new action form. target is 'R<id>' (inspector report) or 'E<id>' (employee reading)
  target = '';
  description = '';
  dueDate = '';

  readonly statuses = ['Open', 'In Progress', 'Completed'];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) { this.error = 'Please log in again.'; return; }

    try { this.managerId = JSON.parse(stored).id; }
    catch { this.error = 'Invalid login data. Please log in again.'; return; }

    // load now, then every 10 seconds
    this.sub = timer(0, 10000).subscribe(() => this.refresh());
  }

  // Reloads inspector reports, employee readings, actions and suggestions
  refresh(): void {
    this.http.get<any>(`${this.api}/industry-manager/${this.managerId}/reports`).subscribe({
      next: d => {
        this.info = {
          industryId: d.industryId,
          industryName: d.industryName,
          industryType: d.industryType,
          reports: (d.inspectorReports || []).slice(0, 30),
          readings: (d.employeeReadings || []).slice(0, 30)
        };

        // keep the selection only if it still exists
        if (this.target && !this.hasTarget(this.target)) this.target = '';

        this.loadActions();
        this.loadSuggestions();
        this.cdr.detectChanges();
      },
      error: e => {
        this.error = typeof e.error === 'string' && e.error ? e.error : 'Could not load your industry.';
        this.cdr.detectChanges();
      }
    });
  }

  private hasTarget(t: string): boolean {
    const id = Number(t.slice(1));
    return t.startsWith('E')
      ? this.info.readings.some((r: any) => r.id === id)
      : this.info.reports.some((r: any) => r.id === id);
  }

  loadActions(): void {
    this.http.get<any[]>(`${this.api}/correctiveactions/industry/${this.info.industryId}`).subscribe({
      next: a => { this.actions = a; this.cdr.detectChanges(); },
      error: () => { this.error = 'Could not load corrective actions.'; this.cdr.detectChanges(); }
    });
  }

  loadSuggestions(): void {
    this.http.get<any>(`${this.api}/corrective-suggestions/${this.managerId}`).subscribe({
      next: s => { this.suggestions = s; this.cdr.detectChanges(); },
      error: () => { this.suggestions = { count: 0, reports: [] }; this.cdr.detectChanges(); }
    });
  }

  // Same limits as the Compliance Status page
  violationsOf(x: any): string[] {
    const v: string[] = [];
    if (x.airQuality > 100) v.push(`Air quality ${x.airQuality} exceeds limit (100)`);
    if (x.waterPh < 6.5 || x.waterPh > 8.5) v.push(`Water pH ${x.waterPh} outside 6.5 to 8.5`);
    if (x.noiseLevel > 75) v.push(`Noise ${x.noiseLevel} dB exceeds limit (75)`);
    if (x.temperature > 40) v.push(`Temperature ${x.temperature} C exceeds limit (40)`);
    if (x.wasteDisposal === 'Improper') v.push('Improper waste disposal');
    return v;
  }

  // Turns an HTTP error into readable text
  private describe(e: any): string {
    const body = typeof e?.error === 'string'
      ? e.error
      : (e?.error?.title || e?.error?.message || JSON.stringify(e?.error || ''));
    return `HTTP ${e?.status ?? '?'} ${body}`.slice(0, 300);
  }

  private body(reportId: number, readingId: number | null, description: string, dueDate: string) {
    return {
      reportId,
      readingId,
      industryId: this.info.industryId,
      createdByUserId: this.managerId,
      description,
      dueDate: dueDate + 'T00:00:00',
      status: 'Open'
    };
  }

  private saveAction(reportId: number, readingId: number | null, description: string, dueDate: string): void {
    this.http.post(`${this.api}/correctiveactions`, this.body(reportId, readingId, description, dueDate)).pipe(
      timeout(15000),
      finalize(() => { this.saving = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.target = '';
        this.description = '';
        this.dueDate = '';
        this.message = 'Corrective action added.';
        this.refresh();
      },
      error: e => {
        this.error = 'Saving the action failed: ' + this.describe(e);
        this.cdr.detectChanges();
      }
    });
  }

  addAction(): void {
    this.message = '';
    this.error = '';

    if (!this.target || !this.description.trim() || !this.dueDate) {
      this.error = 'Choose a report or reading, write a description and pick a due date.';
      return;
    }

    const id = Number(this.target.slice(1));
    const isReading = this.target.startsWith('E');

    this.saving = true;
    this.saveAction(isReading ? 0 : id, isReading ? id : null, this.description.trim(), this.dueDate);
  }

  // Add ONE suggested action
  addSuggested(report: any, s: any): void {
    this.message = '';
    this.error = '';

    this.http.post(`${this.api}/correctiveactions`,
      this.body(report.reportId, null, s.text, s.dueDate)).subscribe({
        next: () => { this.message = 'Suggested action added.'; this.refresh(); },
        error: e => { this.error = 'Could not add the suggested action: ' + this.describe(e); this.cdr.detectChanges(); }
      });
  }

  // Add ALL suggested actions
  addAllSuggested(): void {
    this.message = '';
    this.error = '';

    const calls = [];
    for (const r of this.suggestions.reports) {
      for (const s of r.suggestions) {
        calls.push(this.http.post(`${this.api}/correctiveactions`,
          this.body(r.reportId, null, s.text, s.dueDate)));
      }
    }
    if (calls.length === 0) return;

    forkJoin(calls).subscribe({
      next: () => { this.message = `${calls.length} suggested action(s) added.`; this.refresh(); },
      error: () => { this.error = 'Some actions could not be added.'; this.refresh(); }
    });
  }

  setStatus(a: any, status: string): void {
    this.message = '';
    this.error = '';

    this.http.put(
      `${this.api}/correctiveactions/${a.id}/status`,
      JSON.stringify(status),
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: () => { a.status = status; this.message = 'Status updated.'; this.cdr.detectChanges(); },
      error: () => { this.error = 'Could not update the status.'; this.cdr.detectChanges(); }
    });
  }

  reportLabel(id: number): string {
    const r = this.info?.reports?.find((x: any) => x.id === id);
    return r ? `#${r.id} ${r.reportType} (${r.complianceStatus})` : `#${id}`;
  }

  // What an action is about: an employee reading or an inspector report
  targetLabel(a: any): string {
    if (a.readingId) {
      const x = this.info?.readings?.find((r: any) => r.id === a.readingId);
      return x ? `Employee reading #${x.id} (${x.submittedByName})` : `Employee reading #${a.readingId}`;
    }
    return this.reportLabel(a.reportId);
  }

  isOverdue(a: any): boolean {
    return a.status !== 'Completed' && new Date(a.dueDate).getTime() < Date.now();
  }

  count(status: string): number {
    return this.actions.filter(a => a.status === status).length;
  }

  statusClass(s: string): string {
    return s === 'Completed' ? 'c-ok' : s === 'In Progress' ? 'c-warn' : 'c-bad';
  }

  priorityClass(p: string): string {
    return p === 'High' ? 'c-bad' : p === 'Medium' ? 'c-warn' : 'c-ok';
  }

  trackById(_: number, r: any): number { return r.id; }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
