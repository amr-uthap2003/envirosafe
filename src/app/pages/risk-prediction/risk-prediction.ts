import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Layout } from '../../layout/layout';

interface RiskItem {
  parameter: string;
  value: string;
  status: 'Low' | 'Medium' | 'High';
  reason: string;
}

@Component({
  selector: 'app-risk-prediction',
  standalone: true,
  imports: [CommonModule, RouterLink, Layout],
  templateUrl: './risk-prediction.html',
  styleUrl: './risk-prediction.css'
})
export class RiskPrediction {

  riskItems: RiskItem[] = [
    { parameter: 'Air Quality (AQI)', value: '135', status: 'Medium', reason: 'AQI between 101-150' },
    { parameter: 'Water pH', value: '6.2', status: 'Low', reason: 'Within 6.0-8.5 safe range' },
    { parameter: 'Waste Disposal', value: 'Improper', status: 'High', reason: 'Waste not disposed per standard' }
  ];

  get overallRisk(): string {
    if (this.riskItems.some(i => i.status === 'High')) return 'High';
    if (this.riskItems.some(i => i.status === 'Medium')) return 'Medium';
    return 'Low';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
