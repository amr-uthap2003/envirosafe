import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminLayout } from '../../admin-layout/admin-layout';
import { UserService } from '../../services/user';

export interface AppUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  assignedIndustryId: number | null;
  assignedIndustryName: string | null;
  updatingIndustry?: boolean;
}

export interface IndustryOption {
  id: number;
  name: string;
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
  industries: IndustryOption[] = [];

  loading = true;
  error = '';
  successMessage = '';

  searchTerm = '';
  roleFilter = 'All';

  updatingUserId: number | null = null;
  deletingUserIds = new Set<number>();

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadIndustries();
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
          role: u.role,
          assignedIndustryId: u.assignedIndustryId,
          assignedIndustryName: u.assignedIndustryName
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.error =
          'Failed to load users. Make sure the API is running and you are logged in as Industry Manager.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadIndustries(): void {
    this.http.get<IndustryOption[]>('http://localhost:5180/api/Industries').subscribe({
      next: (data) => {
        this.industries = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading industries:', err);
        this.cdr.markForCheck();
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

  trackByUserId(index: number, user: AppUser): number {
    return user.id;
  }

  // ============================================================
  // OPTIMISTIC UPDATE: UI updates instantly, server call runs in
  // the background, only rolls back on actual failure.
  // ============================================================
  changeRole(user: AppUser, newRole: string): void {
    if (!newRole || newRole === user.role) {
      return;
    }

    const oldRole = user.role;

    // Update UI immediately
    user.role = newRole;
    this.error = '';
    this.successMessage = `${user.fullName}'s role changed to ${newRole}.`;
    this.cdr.markForCheck();
    setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);

    // Sync with server in the background
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        // already applied optimistically, nothing more to do
      },
      error: (err: any) => {
        console.error('Role update error:', err);
        user.role = oldRole;
        this.successMessage = '';
        this.error = err?.error?.message || 'Failed to update user role. Reverted.';
        this.cdr.markForCheck();
      }
    });
  }

  changeIndustry(user: AppUser, newIndustryId: string): void {
    const industryId = newIndustryId ? Number(newIndustryId) : null;

    if (industryId === user.assignedIndustryId) {
      return;
    }

    const oldIndustryId = user.assignedIndustryId;
    const oldIndustryName = user.assignedIndustryName;

    // Update UI immediately using the label already loaded client-side
    const matchedIndustry = this.industries.find(i => i.id === industryId);
    user.assignedIndustryId = industryId;
    user.assignedIndustryName = matchedIndustry ? matchedIndustry.name : null;
    this.error = '';
    this.successMessage = `${user.fullName}'s industry updated to ${user.assignedIndustryName || 'Unassigned'}.`;
    this.cdr.markForCheck();
    setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);

    // Sync with server in the background
    this.userService.updateUserIndustry(user.id, industryId).subscribe({
      next: (response: any) => {
        // Reconcile with server's actual response in case it differs
        user.assignedIndustryId = response.assignedIndustryId;
        user.assignedIndustryName = response.assignedIndustryName;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Industry update error:', err);
        user.assignedIndustryId = oldIndustryId;
        user.assignedIndustryName = oldIndustryName;
        this.successMessage = '';
        this.error = err?.error?.message || 'Failed to update industry assignment. Reverted.';
        this.cdr.markForCheck();
      }
    });
  }

  deleteUser(user: AppUser): void {
    const confirmed = confirm(`Delete ${user.fullName}? This cannot be undone.`);
    if (!confirmed) return;

    this.deletingUserIds.add(user.id);
    this.error = '';
    this.cdr.markForCheck();

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.deletingUserIds.delete(user.id);
        this.successMessage = `${user.fullName} was deleted.`;
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
      },
      error: (err: any) => {
        console.error('Delete user error:', err);
        this.deletingUserIds.delete(user.id);
        this.error = err?.error?.message || 'Failed to delete user.';
        this.cdr.markForCheck();
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
    this.loadIndustries();
  }

}
