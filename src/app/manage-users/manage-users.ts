import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AppUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'inspector' | 'manager' | 'employee';
  industry: string;
  updating: boolean;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css',
})
export class ManageUsers {
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  searchTerm = '';
  roleFilter = '';

  roles: AppUser['role'][] = ['admin', 'inspector', 'manager', 'employee'];
  industries: string[] = ['Manufacturing', 'Chemicals', 'Textiles', 'Food & Beverage', 'Unassigned'];

  users: AppUser[] = [
    { id: 1, name: 'Amrutha Nair', email: 'amrutha@envirosafe.com', role: 'admin', industry: 'Unassigned', updating: false },
    { id: 2, name: 'Rahul Menon', email: 'rahul@envirosafe.com', role: 'inspector', industry: 'Manufacturing', updating: false },
    { id: 3, name: 'Sneha Pillai', email: 'sneha@envirosafe.com', role: 'manager', industry: 'Chemicals', updating: false },
    { id: 4, name: 'Arjun Das', email: 'arjun@envirosafe.com', role: 'employee', industry: 'Textiles', updating: false },
  ];

  get filteredUsers(): AppUser[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.users.filter(u => {
      const matchesTerm =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchesRole = !this.roleFilter || u.role === this.roleFilter;
      return matchesTerm && matchesRole;
    });
  }

  badgeClass(role: AppUser['role']): string {
    return `badge badge-${role}`;
  }

  onIndustryChange(user: AppUser, newIndustry: string): void {
    user.updating = true;
    user.industry = newIndustry;
    setTimeout(() => {
      user.updating = false;
      this.successMessage = `Updated industry for ${user.name}`;
      setTimeout(() => (this.successMessage = ''), 2500);
    }, 400);
  }

  onRoleChange(user: AppUser, newRole: AppUser['role']): void {
    user.updating = true;
    user.role = newRole;
    setTimeout(() => {
      user.updating = false;
      this.successMessage = `Updated role for ${user.name}`;
      setTimeout(() => (this.successMessage = ''), 2500);
    }, 400);
  }

  deleteUser(user: AppUser): void {
    const confirmed = confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    user.updating = true;
    setTimeout(() => {
      this.users = this.users.filter(u => u.id !== user.id);
      this.successMessage = `${user.name} was deleted`;
      setTimeout(() => (this.successMessage = ''), 2500);
    }, 400);
  }

  addUser(): void {
    // TODO: open add-user modal/route
  }
}
