import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';
import { ReportService, ReportModel } from '../../services/report';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InspectionRecord {
  id: number;
  industryName: string;
  date: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
  notes: string;
}

@Component({
  selector: 'app-my-inspections',
  standalone: true,
  imports: [CommonModule, FormsModule, InspectorLayout],
  templateUrl: './my-inspections.html',
  styleUrl: './my-inspections.css'
})
export class MyInspections implements OnInit, OnDestroy {

  inspections: InspectionRecord[] = [];
  filteredInspections: InspectionRecord[] = [];

  loading = true;
  error = '';

  searchTerm = '';
  statusFilter = 'All';
  riskFilter = 'All';
  dateFrom = '';
  dateTo = '';

  private pollSub?: Subscription;

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadMyInspections();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadMyInspections(): void {
    this.error = '';

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      this.error = 'You must be logged in to view your inspections.';
      this.loading = false;
      return;
    }

    const currentUser = JSON.parse(currentUserStr);

    this.pollSub = timer(0, 10000)
      .pipe(
        switchMap(() =>
          this.reportService.getAllReports().pipe(
            catchError((err: any) => {
              console.error('Error loading inspections:', err);
              this.error = 'Failed to load inspections. Make sure the API is running.';
              return of(null);
            })
          )
        )
      )
      .subscribe((data: ReportModel[] | null) => {
        if (data) {
          this.error = '';

          const myReports = data.filter(r => r.submittedByUserId === currentUser.id);

          this.inspections = myReports.map(r => ({
            id: r.id,
            industryName: (r as any).industry?.name || 'Unknown',
            date: r.reportDate.split('T')[0],
            complianceStatus: r.complianceStatus,
            riskLevel: r.riskLevel,
            notes: r.description
          }));

          this.applyFilters();
        }
        this.loading = false;
      });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredInspections = this.inspections.filter(i => {
      const matchesSearch =
        !term ||
        i.industryName.toLowerCase().includes(term) ||
        i.date.includes(term);

      const matchesStatus =
        this.statusFilter === 'All' || i.complianceStatus === this.statusFilter;

      const matchesRisk =
        this.riskFilter === 'All' || i.riskLevel === this.riskFilter;

      const matchesDateFrom = !this.dateFrom || i.date >= this.dateFrom;
      const matchesDateTo = !this.dateTo || i.date <= this.dateTo;

      return matchesSearch && matchesStatus && matchesRisk && matchesDateFrom && matchesDateTo;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All';
    this.riskFilter = 'All';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  downloadPdf(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const inspectorName = user.fullName || user.username || '';

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('My Inspections Report', 14, 18);

    doc.setFontSize(10);
    doc.text(`Inspector: ${inspectorName}`, 14, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 31);
    doc.text(`Total records: ${this.filteredInspections.length}`, 14, 37);

    autoTable(doc, {
      startY: 43,
      head: [['Industry', 'Date', 'Compliance', 'Risk Level', 'Notes']],
      body: this.filteredInspections.map(i => [
        i.industryName,
        i.date,
        i.complianceStatus,
        i.riskLevel,
        i.notes || '-'
      ]),
      headStyles: { fillColor: [6, 120, 85] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 4: { cellWidth: 60 } }
    });

    doc.save(`my-inspections-${new Date().toISOString().split('T')[0]}.pdf`);
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
