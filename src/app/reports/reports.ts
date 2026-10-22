import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

import { Layout } from '../layout/layout';
import { ReportService, ReportModel } from '../services/report';

interface FeedItem {
  key: string;
  source: 'Inspector' | 'Employee' | 'Manager';
  reportType: string;
  description: string;
  details: string;
  reportDate: any;
  complianceStatus: string;
  riskLevel: string;
  activeViolations: number;
  submittedByName: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit, OnDestroy {

  inspectorReports: ReportModel[] = [];
  employeeReadings: any[] = [];
  feed: FeedItem[] = [];

  industryId: number | null = null;
  industryName = '';
  industryType = '';
  noIndustry = false;
  error = '';

  search = '';
  statusFilter = 'All';
  riskFilter = 'All';
  sourceFilter = 'All';

  showForm = false;
  saving = false;
  formMessage = '';
  form = {
    reportType: 'Monthly Report',
    description: '',
    riskLevel: 'Low' as 'Low' | 'Medium' | 'High',
    activeViolations: 0,
    complianceStatus: 'Under Review' as 'Compliant' | 'Non-Compliant' | 'Under Review'
  };

  private user: any = null;
  private sub?: Subscription;

  constructor(
    private http: HttpClient,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) { this.error = 'Please log in again.'; return; }

    try { this.user = JSON.parse(stored); }
    catch { this.error = 'Invalid login data. Please log in again.'; return; }

    this.sub = interval(10000).pipe(
      startWith(0),
      switchMap(() =>
        this.http.get<any>(`http://localhost:5180/api/industry-manager/${this.user.id}/reports`))
    ).subscribe({
      next: d => {
        this.industryId = d.industryId;
        this.industryName = d.industryName || '';
        this.industryType = d.industryType || '';
        this.inspectorReports = d.inspectorReports || [];
        this.employeeReadings = d.employeeReadings || [];
        this.noIndustry = false;
        this.error = '';
        this.rebuild();
        this.cdr.detectChanges();
      },
      error: e => {
        const msg = typeof e.error === 'string' ? e.error : '';
        if (msg.includes('No industry assigned')) {
          this.noIndustry = true;
          this.inspectorReports = [];
          this.employeeReadings = [];
          this.rebuild();
        } else {
          this.error = msg || 'Could not load reports.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // Combine inspector reports and employee readings into one list
  private rebuild(): void {
    const fromReports: FeedItem[] = this.inspectorReports.map((r: any) => ({
      key: 'R' + r.id,
      source: (r.submittedByUserId === this.user?.id ? 'Manager' : 'Inspector') as FeedItem['source'],
      reportType: r.reportType,
      description: r.description,
      details: '',
      reportDate: r.reportDate,
      complianceStatus: r.complianceStatus,
      riskLevel: r.riskLevel,
      activeViolations: r.activeViolations,
      submittedByName: r.submittedByName
    }));

    const fromReadings: FeedItem[] = this.employeeReadings.map((x: any) => this.readingToItem(x));

    this.feed = [...fromReports, ...fromReadings].sort(
      (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
    );
  }

  // Same limits as the Compliance Status page
  private readingToItem(x: any): FeedItem {
    const v: string[] = [];
    if (x.airQuality > 100) v.push(`Air quality ${x.airQuality} exceeds limit (100)`);
    if (x.waterPh < 6.5 || x.waterPh > 8.5) v.push(`Water pH ${x.waterPh} outside 6.5 to 8.5`);
    if (x.noiseLevel > 75) v.push(`Noise ${x.noiseLevel} dB exceeds limit (75)`);
    if (x.temperature > 40) v.push(`Temperature ${x.temperature}°C exceeds limit (40)`);
    if (x.wasteDisposal === 'Improper') v.push('Improper waste disposal');

    return {
      key: 'E' + x.id,
      source: 'Employee',
      reportType: 'Employee Reading',
      description: v.length ? v.join('; ') : 'All parameters are within their limits.',
      details: `AQI ${x.airQuality} | pH ${x.waterPh} | Noise ${x.noiseLevel} dB | Temp ${x.temperature} °C | Waste ${x.wasteDisposal}`,
      reportDate: x.submittedAt,
      complianceStatus: v.length ? 'Non-Compliant' : 'Compliant',
      riskLevel: v.length === 0 ? 'Low' : v.length <= 2 ? 'Medium' : 'High',
      activeViolations: v.length,
      submittedByName: x.submittedByName || 'Employee'
    };
  }

  get total() { return this.feed.length; }
  get compliant() { return this.feed.filter(r => r.complianceStatus === 'Compliant').length; }
  get nonCompliant() { return this.feed.filter(r => r.complianceStatus === 'Non-Compliant').length; }
  get underReview() { return this.feed.filter(r => r.complianceStatus === 'Under Review').length; }

  get filtered(): FeedItem[] {
    const q = this.search.trim().toLowerCase();
    return this.feed.filter(r =>
      (this.sourceFilter === 'All' || r.source === this.sourceFilter) &&
      (this.statusFilter === 'All' || r.complianceStatus === this.statusFilter) &&
      (this.riskFilter === 'All' || r.riskLevel === this.riskFilter) &&
      (!q ||
        this.industryName.toLowerCase().includes(q) ||
        this.industryType.toLowerCase().includes(q) ||
        (r.reportType || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.submittedByName || '').toLowerCase().includes(q))
    );
  }

  resetFilters(): void {
    this.search = '';
    this.statusFilter = 'All';
    this.riskFilter = 'All';
    this.sourceFilter = 'All';
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.formMessage = '';
  }

  submit(): void {
    if (this.industryId === null) return;
    if (!this.form.description.trim()) {
      this.formMessage = 'Please enter a description.';
      return;
    }

    this.saving = true;
    this.reportService.submitReport({
      industryId: this.industryId,
      reportType: this.form.reportType,
      description: this.form.description.trim(),
      riskLevel: this.form.riskLevel,
      activeViolations: Number(this.form.activeViolations) || 0,
      complianceStatus: this.form.complianceStatus,
      submittedByUserId: this.user.id,
      submittedByName: this.user.fullName || this.user.username || 'Manager'
    }).subscribe({
      next: (created: any) => {
        this.inspectorReports = [created, ...this.inspectorReports];
        this.rebuild();
        this.form.description = '';
        this.form.activeViolations = 0;
        this.showForm = false;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.formMessage = 'Could not save the report.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  download(r: FeedItem): void {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Industry', 'Industry Type', 'Source', 'Report Type', 'Date', 'Compliance Status', 'Risk Level', 'Violations', 'Submitted By', 'Description', 'Details'],
      [this.industryName, this.industryType, r.source, r.reportType, r.reportDate, r.complianceStatus,
      r.riskLevel, r.activeViolations, r.submittedByName, r.description, r.details]
    ];
    const csv = rows.map(row => row.map(esc).join(',')).join('\r\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${this.industryName.replace(/\s+/g, '-')}-${r.key}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  trackByKey(_: number, r: FeedItem): string { return r.key; }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
