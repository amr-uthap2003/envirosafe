import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Layout } from '../../layout/layout';
import { IndustryService, IndustryModel } from '../../services/industry';

@Component({
  selector: 'app-manage-industries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Layout
  ],
  templateUrl: './manage-industries.html',
  styleUrl: './manage-industries.css'
})
export class ManageIndustries implements OnInit {

  industries: IndustryModel[] = [];

  loading = true;
  error = '';
  successMessage = '';

  // New industry form fields
  newName = '';
  newLocation = '';
  newType = '';

  constructor(private industryService: IndustryService) { }

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

  addIndustry(): void {
    if (!this.newName || !this.newLocation || !this.newType) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.error = '';

    this.industryService.addIndustry({
      name: this.newName,
      location: this.newLocation,
      type: this.newType
    }).subscribe({
      next: () => {
        this.successMessage = `${this.newName} added successfully.`;
        this.newName = '';
        this.newLocation = '';
        this.newType = '';
        this.loadIndustries();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Error adding industry:', err);
        this.error = 'Failed to add industry.';
      }
    });
  }

  deleteIndustry(id: number): void {
    if (!confirm('Are you sure you want to delete this industry?')) {
      return;
    }

    this.industryService.deleteIndustry(id).subscribe({
      next: () => {
        this.loadIndustries();
      },
      error: (err: any) => {
        console.error('Error deleting industry:', err);
        this.error = 'Failed to delete industry.';
      }
    });
  }

}
