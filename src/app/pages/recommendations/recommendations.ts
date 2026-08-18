import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Layout } from '../../layout/layout';

interface Recommendation {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink, Layout],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.css'
})
export class Recommendations {

  recommendations: Recommendation[] = [
    {
      title: 'Install additional air filtration',
      description: 'AQI readings have trended toward Medium risk. Adding filtration reduces exceedance frequency.',
      priority: 'High',
      category: 'Air Quality'
    },
    {
      title: 'Review waste disposal schedule',
      description: 'Waste disposal was flagged improper in the latest inspection. Align pickup schedule with regulation.',
      priority: 'High',
      category: 'Waste Management'
    },
    {
      title: 'Continue current water treatment process',
      description: 'Water pH is within safe range. No action needed, maintain current monitoring frequency.',
      priority: 'Low',
      category: 'Water Quality'
    }
  ];

  getPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }
}
