import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './admin-industries.html',
  styleUrl: './admin-industries.css'
})
export class AdminIndustries implements OnInit {

  private apiUrl = 'http://localhost:5180/api/industries';

  industries: IndustryRecord[] = [];
  loading = false;
  loadError = '';

  // Add modal state
  showAddModal = false;
  error = '';

  // New industry form fields
  newName = '';
  newType = '';
  newLocation = '';
  newManager = '';
  newStatus: 'Active' | 'Inactive' = 'Active';
  newCompliance: 'Compliant' | 'Non-Compliant' | 'Under Review' = 'Under Review';
  newRisk: 'Low' | 'Medium' | 'High' = 'Medium';

  // Edit modal state
  showEditModal = false;
  editError = '';
  editId: number | null = null;
  editName = '';
  editType = '';
  editLocation = '';
  editManager = '';
  editStatus: 'Active' | 'Inactive' = 'Active';
  editCompliance: 'Compliant' | 'Non-Compliant' | 'Under Review' = 'Under Review';
  editRisk: 'Low' | 'Medium' | 'High' = 'Medium';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchIndustries();
  }

  fetchIndustries(): void {
    this.loading = true;
    this.loadError = '';
    this.http.get<IndustryRecord[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.industries = data;
        this.loading = false;
      },
      error: (err) => {
        this.loadError = 'Failed to load industries.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openAddModal(): void {
    this.error = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newName = '';
    this.newType = '';
    this.newLocation = '';
    this.newManager = '';
    this.newStatus = 'Active';
    this.newCompliance = 'Under Review';
    this.newRisk = 'Medium';
  }

  addIndustry(): void {
    if (!this.newName || !this.newType || !this.newLocation) {
      this.error = 'Please fill in Industry Name, Type, and Location.';
      return;
    }

    const payload = {
      name: this.newName,
      type: this.newType,
      location: this.newLocation,
      manager: this.newManager || 'Unassigned',
      status: this.newStatus,
      complianceStatus: this.newCompliance,
      riskLevel: this.newRisk
    };

    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: () => {
        this.fetchIndustries();
        this.closeAddModal();
      },
      error: (err) => {
        this.error = 'Failed to add industry. Please try again.';
        console.error(err);
      }
    });
  }

  deleteIndustry(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.fetchIndustries(),
      error: (err) => console.error(err)
    });
  }

  confirmDelete(ind: IndustryRecord): void {
    if (confirm(`Are you sure you want to delete "${ind.name}"?`)) {
      this.deleteIndustry(ind.id);
    }
  }

  openEditModal(ind: IndustryRecord): void {
    this.editError = '';
    this.editId = ind.id;
    this.editName = ind.name;
    this.editType = ind.type;
    this.editLocation = ind.location;
    this.editManager = ind.manager;
    this.editStatus = ind.status;
    this.editCompliance = ind.complianceStatus;
    this.editRisk = ind.riskLevel;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editId = null;
  }

  saveEdit(): void {
    if (!this.editName || !this.editType || !this.editLocation) {
      this.editError = 'Please fill in Industry Name, Type, and Location.';
      return;
    }

    const payload = {
      name: this.editName,
      type: this.editType,
      location: this.editLocation,
      manager: this.editManager || 'Unassigned',
      status: this.editStatus,
      complianceStatus: this.editCompliance,
      riskLevel: this.editRisk
    };

    this.http.put<any>(`${this.apiUrl}/${this.editId}`, payload).subscribe({
      next: () => {
        this.fetchIndustries();
        this.closeEditModal();
      },
      error: (err) => {
        this.editError = 'Failed to update industry. Please try again.';
        console.error(err);
      }
    });
  }

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
