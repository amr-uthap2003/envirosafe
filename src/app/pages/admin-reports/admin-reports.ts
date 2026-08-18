import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayout } from '../../admin-layout/admin-layout';

export interface ComplianceReport {
  id: number;
  industryName: string;
  industryType: string;
  reportDate: string;
  reportType: 'Monthly' | 'Quarterly' | 'Incident' | 'Annual';
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
  activeViolations: number;
  summary: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit {

  // TODO: replace with GET /api/reports once your backend endpoint exists
  allReports: ComplianceReport[] = [
    {
      id: 1,
      industryName: 'Green Textile Industries',
      industryType: 'Textile Manufacturing',
      reportDate: '2026-08-01',
      reportType: 'Monthly',
      complianceStatus: 'Compliant',
      riskLevel: 'Medium',
      activeViolations: 2,
      summary: 'Air quality within permissible limits. Two minor violations logged for noise levels during peak hours.'
    },
    {
      id: 2,
      industryName: 'Sunrise Chemicals Pvt Ltd',
      industryType: 'Chemical Processing',
      reportDate: '2026-08-05',
      reportType: 'Incident',
      complianceStatus: 'Under Review',
      riskLevel: 'High',
      activeViolations: 1,
      summary: 'Unusual temperature spike detected by DHT11 sensor. Awaiting inspector confirmation.'
    },
    {
      id: 3,
      industryName: 'EcoPack Solutions',
      industryType: 'Packaging',
      reportDate: '2026-06-15',
      reportType: 'Quarterly',
      complianceStatus: 'Compliant',
      riskLevel: 'Low',
      activeViolations: 0,
      summary: 'All environmental parameters within safe range for the full quarter.'
    }
  ];

  filteredReports: ComplianceReport[] = [];

  searchTerm = '';
  statusFilter = 'All';
  riskFilter = 'All';

  totalReports = 0;
  compliantCount = 0;
  nonCompliantCount = 0;
  underReviewCount = 0;

  ngOnInit(): void {
    this.applyFilters();
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
    alert(`Download started for report #${report.id} — ${report.industryName} (${report.reportDate})`);
    // TODO: call this.reportService.downloadReport(report.id) once the API endpoint exists
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
