import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeLayout } from '../../employee-layout/employee-layout';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, EmployeeLayout],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard {

  assignedIndustry = 'Green Textile Industries';
  totalSubmissions = 8;
  lastSubmissionDate = 'Today, 9:15 AM';

}
