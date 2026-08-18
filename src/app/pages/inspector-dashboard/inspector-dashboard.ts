import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';

@Component({
  selector: 'app-inspector-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, InspectorLayout],
  templateUrl: './inspector-dashboard.html',
  styleUrl: './inspector-dashboard.css'
})
export class InspectorDashboard {

  pendingInspections = 3;
  completedThisMonth = 7;
  flaggedViolations = 2;

}
