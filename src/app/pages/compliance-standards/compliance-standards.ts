import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-compliance-standards',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './compliance-standards.html',
  styleUrl: './compliance-standards.css'
})
export class ComplianceStandards {

}
