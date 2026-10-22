import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayout } from '../../admin-layout/admin-layout';
import { ReportService, ReportModel } from '../../services/report';
import { ReadingService, EnvironmentalReading } from '../../services/reading.service';
import jsPDF from 'jspdf';

export interface ComplianceReport {
  id: number;
  industryName: string;
  industryType: string;
  reportDate: string;
  reportType: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
  activeViolations: number;
  summary: string;
}

export interface ReadingNotification {
  id: number;
  name: string;
  role: string;
  submittedAt: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit, OnDestroy {

  allReports: ComplianceReport[] = [];
  filteredReports: ComplianceReport[] = [];

  // Employee-submitted readings, shown alongside inspector reports
  allReadings: EnvironmentalReading[] = [];

  // Notification state
  notifications: ReadingNotification[] = [];
  showNotifications = false;
  private knownReadingIds = new Set<number>();
  private pollHandle: any;

  loading = true;
  error = '';

  searchTerm = '';
  statusFilter = 'All';
  riskFilter = 'All';

  totalReports = 0;
  compliantCount = 0;
  nonCompliantCount = 0;
  underReviewCount = 0;

  constructor(
    private reportService: ReportService,
    private readingService: ReadingService
  ) { }

  ngOnInit(): void {
    this.loadReports();
    this.loadReadings(true); // true = first load, just baseline the ids, no notifications
    this.pollHandle = setInterval(() => this.loadReadings(false), 15000); // poll every 15s
  }

  ngOnDestroy(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
    }
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';

    this.reportService.getAllReports().subscribe({
      next: (data: ReportModel[]) => {
        this.allReports = data.map(r => ({
          id: r.id,
          industryName: (r as any).industry?.name || 'Unknown',
          industryType: (r as any).industry?.type || 'Unknown',
          reportDate: r.reportDate.split('T')[0],
          reportType: r.reportType,
          complianceStatus: r.complianceStatus,
          riskLevel: r.riskLevel,
          activeViolations: r.activeViolations,
          summary: r.description
        }));

        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading reports:', err);
        this.error = 'Failed to load reports. Make sure the API is running.';
        this.loading = false;
      }
    });
  }

  loadReadings(isFirstLoad: boolean): void {
    this.readingService.getAllReadings().subscribe({
      next: (data: EnvironmentalReading[]) => {
        if (isFirstLoad) {
          // Baseline: mark everything currently in the DB as already seen
          data.forEach(r => this.knownReadingIds.add(r.id));
          this.allReadings = data;
          return;
        }

        // Find readings that weren't there before -> new submissions
        const newOnes = data.filter(r => !this.knownReadingIds.has(r.id));

        if (newOnes.length > 0) {
          newOnes.forEach(r => {
            this.knownReadingIds.add(r.id);
            this.notifications.unshift({
              id: r.id,
              name: r.submittedByName,
              role: r.submittedByRole,
              submittedAt: r.submittedAt
            });
          });
        }

        this.allReadings = data;
      },
      error: (err: any) => {
        console.error('Error loading readings:', err);
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  dismissNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredReports = this.allReports.filter(r => {
      const matchesSearch =
        !term ||
        r.industryName.toLowerCase().includes(term) ||
        r.industryType.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'All' || r.complianceStatus === this.statusFilter;

      const matchesRisk =
        this.riskFilter === 'All' || r.riskLevel === this.riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });

    this.updateSummary();
  }

  updateSummary(): void {
    this.totalReports = this.allReports.length;
    this.compliantCount = this.allReports.filter(r => r.complianceStatus === 'Compliant').length;
    this.nonCompliantCount = this.allReports.filter(r => r.complianceStatus === 'Non-Compliant').length;
    this.underReviewCount = this.allReports.filter(r => r.complianceStatus === 'Under Review').length;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All';
    this.riskFilter = 'All';
    this.applyFilters();
  }

  downloadReport(report: ComplianceReport): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('EnviroSafe Compliance Report', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report #${report.id}`, 14, 28);

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    let y = 42;
    const lineGap = 10;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += lineGap;
    };

    addRow('Industry', report.industryName);
    addRow('Industry Type', report.industryType);
    addRow('Report Type', report.reportType);
    addRow('Report Date', report.reportDate);
    addRow('Compliance Status', report.complianceStatus);
    addRow('Risk Level', report.riskLevel);
    addRow('Active Violations', String(report.activeViolations));

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Summary / Notes:', 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(report.summary, 180);
    doc.text(summaryLines, 14, y);

    doc.save(`Report-${report.id}-${report.industryName}.pdf`);
  }

  downloadReading(reading: EnvironmentalReading): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('EnviroSafe Environmental Reading', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Reading #${reading.id}`, 14, 28);

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    let y = 42;
    const lineGap = 10;

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += lineGap;
    };

    addRow('Submitted By', reading.submittedByName);
    addRow('Role', reading.submittedByRole);
    addRow('Submitted At', new Date(reading.submittedAt).toLocaleString());
    addRow('Air Quality', String(reading.airQuality));
    addRow('Water pH', String(reading.waterPh));
    addRow('Noise Level', String(reading.noiseLevel));
    addRow('Temperature', String(reading.temperature));
    addRow('Waste Disposal', reading.wasteDisposal);

    if (reading.notes) {
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(reading.notes, 180);
      doc.text(notesLines, 14, y);
    }

    doc.save(`Reading-${reading.id}-${reading.submittedByName}.pdf`);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Compliant': return 'badge-compliant';
      case 'Non-Compliant': return 'badge-noncompliant';
      case 'Under Review': return 'badge-review';
      default: return '';
    }
  }

  riskClass(risk: string): string {
    switch (risk) {
      case 'Low': return 'risk-low';
      case 'Medium': return 'risk-medium';
      case 'High': return 'risk-high';
      default: return '';
    }
  }
}
