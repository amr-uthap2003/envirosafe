import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout } from '../../layout/layout';
import { IndustryService, IndustryModel } from '../../services/industry';

@Component({
  selector: 'app-manage-industries',
  standalone: true,
  imports: [
    CommonModule,
    Layout
  ],
  templateUrl: './manage-industries.html',
  styleUrl: './manage-industries.css'
})
export class ManageIndustries implements OnInit {

  industries: IndustryModel[] = [];

  loading = true;
  error = '';

  constructor(
    private industryService: IndustryService,
    private cdr: ChangeDetectorRef
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading industries:', err);
        this.error = 'Failed to load industries. Make sure the API is running.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
