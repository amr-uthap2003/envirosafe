import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';
import { IndustryService, IndustryModel } from '../../services/industry';
import { ReportService } from '../../services/report';

@Component({
  selector: 'app-inspect-industry',
  standalone: true,
  imports: [CommonModule, FormsModule, InspectorLayout],
  templateUrl: './inspect-industry.html',
  styleUrl: './inspect-industry.css'
})
export class InspectIndustry implements OnInit {

  industries: IndustryModel[] = [];
  loading = true;
  error = '';

  selectedIndustryId: number | null = null;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review' = 'Compliant';
  riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  violationNotes = '';
  submitting = false;

  constructor(
    private router: Router,
    private industryService: IndustryService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.loadIndustries();
  }

  loadIndustries(): void {
    this.loading = true;
    this.error = '';

    this.industryService.getAllIndustries().subscribe({
      next: (data: IndustryModel[]) => {
        this.industries = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading industries:', err);
        this.error = 'Failed to load industries. Make sure the API is running.';
        this.loading = false;
      }
    });
  }

  submitInspection(): void {
    if (!this.selectedIndustryId) {
      alert('Please select an industry to inspect.');
      return;
    }

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      alert('You must be logged in to submit a report.');
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = JSON.parse(currentUserStr);

    this.submitting = true;

    this.reportService.submitReport({
      industryId: this.selectedIndustryId,
      reportType: 'Incident Report',
      description: this.violationNotes,
      riskLevel: this.riskLevel,
      activeViolations: this.complianceStatus === 'Compliant' ? 0 : 1,
      complianceStatus: this.complianceStatus,
      submittedByUserId: currentUser.id,
      submittedByName: currentUser.fullName
    }).subscribe({
      next: () => {
        this.submitting = false;
        alert('Inspection recorded successfully!');
        this.router.navigate(['/my-inspections']);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Error submitting report:', err);
        alert('Failed to submit report. Please try again.');
      }
    });
  }
}
