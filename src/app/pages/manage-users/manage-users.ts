import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayout } from '../../admin-layout/admin-layout';
import { UserService } from '../../services/user';

export interface AppUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminLayout
  ],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsers implements OnInit {

  users: AppUser[] = [];

  loading = true;
  error = '';
  successMessage = '';

  searchTerm = '';
  roleFilter = 'All';

  updatingUserId: number | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.users = data.map(u => ({
          id: u.id,
          fullName: u.fullName,
          username: u.username,
          email: u.email,
          phoneNumber: u.phoneNumber,
          role: u.role
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.error =
          'Failed to load users. Make sure the API is running and you are logged in as Industry Manager.';
        this.loading = false;
      }
    });
  }

  get filteredUsers(): AppUser[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.users.filter(user => {
      const matchesSearch =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesRole =
        this.roleFilter === 'All' ||
        user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }

  roleClass(role: string): string {
    switch (role) {
      case 'Admin':
        return 'badge-admin';
      case 'Inspector':
        return 'badge-inspector';
      case 'Industry Manager':
        return 'badge-manager';
      case 'Employee':
        return 'badge-employee';
      default:
        return '';
    }
  }

  changeRole(user: AppUser, newRole: string): void {
    if (!newRole || newRole === user.role) {
      return;
    }

    const oldRole = user.role;

    this.updatingUserId = user.id;
    this.error = '';
    this.successMessage = '';

    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (response: any) => {
        user.role = newRole;
        this.updatingUserId = null;
        this.successMessage =
          `${user.fullName}'s role changed from ${oldRole} to ${newRole}.`;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Role update error:', err);
        this.updatingUserId = null;
        this.error =
          err?.error?.message ||
          'Failed to update user role.';
        user.role = oldRole;
      }
    });
  }

  addUser(): void {
    alert(
      'Users should register through the Registration page. ' +
      'After registration, they will automatically appear here.'
    );
  }

  refreshUsers(): void {
    this.loadUsers();
  }

}
