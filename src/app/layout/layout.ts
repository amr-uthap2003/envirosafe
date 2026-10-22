import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {

  unreadCount = 0;

  // Logged-in user details shown in the sidebar profile block
  userName = '';
  userRole = '';
  initials = '';

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();

    this.notificationService.getAllNotifications().subscribe({
      next: (data) => {
        this.unreadCount = data.filter(n => !n.isRead).length;
      },
      error: (err) => console.error('Failed to load notification count:', err)
    });
  }

  private loadCurrentUser(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      return;
    }

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
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
