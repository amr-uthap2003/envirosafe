import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayout } from '../../admin-layout/admin-layout';

export interface IndustryRecord {
  id: number;
  name: string;
  type: string;
  location: string;
  manager: string;
  status: 'Active' | 'Inactive';
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
}

@Component({
  selector: 'app-admin-industries',
  standalone: true,
  imports: [CommonModule, AdminLayout],
  templateUrl: './admin-industries.html',
  styleUrl: './admin-industries.css'
})
export class AdminIndustries {

  // TODO: replace with GET /api/industries once your backend endpoint exists
  industries: IndustryRecord[] = [
    {
      id: 1,
      name: 'Green Textile Industries',
      type: 'Textile',
      location: 'Kerala, India',
      manager: 'Radhika',
      status: 'Active',
      complianceStatus: 'Compliant',
      riskLevel: 'Medium'
    },
    {
      id: 2,
      name: 'Sunrise Chemicals Pvt Ltd',
      type: 'Chemical Processing',
      location: 'Kerala, India',
      manager: 'Unassigned',
      status: 'Active',
      complianceStatus: 'Under Review',
      riskLevel: 'High'
    },
    {
      id: 3,
      name: 'EcoPack Solutions',
      type: 'Packaging',
      location: 'Kerala, India',
      manager: 'Unassigned',
      status: 'Inactive',
      complianceStatus: 'Compliant',
      riskLevel: 'Low'
    }
  ];

  complianceClass(status: string): string {
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
