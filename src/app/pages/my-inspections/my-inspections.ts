import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';

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
  imports: [CommonModule, InspectorLayout],
  templateUrl: './my-inspections.html',
  styleUrl: './my-inspections.css'
})
export class MyInspections {

  // TODO: replace with GET /api/inspections?userId={currentUserId} once backend exists
  inspections: InspectionRecord[] = [
    {
      id: 1,
      industryName: 'Green Textile Industries',
      date: '2026-08-16',
      complianceStatus: 'Compliant',
      riskLevel: 'Medium',
      notes: 'Minor noise violation during peak hours.'
    },
    {
      id: 2,
      industryName: 'Sunrise Chemicals Pvt Ltd',
      date: '2026-08-14',
      complianceStatus: 'Under Review',
      riskLevel: 'High',
      notes: 'Temperature spike flagged, awaiting confirmation.'
    },
    {
      id: 3,
      industryName: 'EcoPack Solutions',
      date: '2026-08-10',
      complianceStatus: 'Compliant',
      riskLevel: 'Low',
      notes: 'No issues found.'
    }
  ];

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

