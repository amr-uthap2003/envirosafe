import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './employee-layout.html',
  styleUrl: './employee-layout.css'
})
export class EmployeeLayout implements OnInit {

  fullName = 'Employee';
  role = 'Factory Staff';
  avatarLetter = 'E';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.fullName = user.fullName || 'Employee';
      this.role = user.role || 'Factory Staff';
      this.avatarLetter = this.fullName.charAt(0).toUpperCase();
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
