import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ManagerRecommendations } from '../../manager-recommendations/manager-recommendations';
import { EmployeeLayout } from '../../employee-layout/employee-layout';
import { InspectorLayout } from '../../inspector-layout/inspector-layout';

@Component({
  selector: 'app-my-recommendations',
  standalone: true,
  imports: [CommonModule, ManagerRecommendations, EmployeeLayout, InspectorLayout],
  templateUrl: './my-recommendations.html',
  styleUrl: './my-recommendations.css'
})
export class MyRecommendations implements OnInit {
  userName = '';
  role = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      const user = JSON.parse(stored);
      this.userName = user.fullName || user.username || '';
      this.role = user.role || '';
    } catch {
      this.router.navigate(['/login']);
    }
  }
}
