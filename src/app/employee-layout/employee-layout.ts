import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './employee-layout.html',
  styleUrl: './employee-layout.css'
})
export class EmployeeLayout {

  constructor(private router: Router) { }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
