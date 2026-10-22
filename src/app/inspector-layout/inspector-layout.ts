import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-inspector-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './inspector-layout.html',
  styleUrl: './inspector-layout.css'
})
export class InspectorLayout implements OnInit {

  userName = '';
  userRole = '';
  initials = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private loadCurrentUser(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      return;
    }

    try {
      const user = JSON.parse(stored);

      this.userName = user.fullName || user.username || '';
      this.userRole = user.role || '';

      this.initials = this.userName
        .split(' ')
        .filter((part: string) => part.length > 0)
        .map((part: string) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    } catch {
      // Corrupted storage entry; leave the defaults
    }
  }
}
