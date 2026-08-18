import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayout } from '../../admin-layout/admin-layout';

@Component({
  selector: 'app-admin-compliance-standards',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayout],
  templateUrl: './admin-compliance-standards.html',
  styleUrl: './admin-compliance-standards.css'
})
export class AdminComplianceStandards {

}
