import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';
import { IndustryService, IndustryModel } from '../../services/industry';

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

  constructor(
    private router: Router,
    private industryService: IndustryService
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

    const selected = this.industries.find(i => i.id === this.selectedIndustryId);

    // TODO: replace with POST /api/inspections once backend exists
    console.log('Submitting inspection:', {
      industryId: this.selectedIndustryId,
      industryName: selected?.name,
      complianceStatus: this.complianceStatus,
      riskLevel: this.riskLevel,
      violationNotes: this.violationNotes,
      inspectedAt: new Date().toISOString()
    });

    alert('Inspection recorded successfully!');
    this.router.navigate(['/my-inspections']);
  }
}

