import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Layout } from '../../layout/layout';

@Component({
  selector: 'app-industry-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Layout],
  templateUrl: './industry-manager-dashboard.html',
  styleUrl: './industry-manager-dashboard.css'
})
export class IndustryManagerDashboard {

  constructor(private router: Router) { }

  goToEnvironmentalData(): void {
    this.router.navigate(['/environmental-data']);
  }

  goToRiskPrediction(): void {
    this.router.navigate(['/risk-prediction']);
  }

  goToRecommendations(): void {
    this.router.navigate(['/recommendations']);
  }
}
