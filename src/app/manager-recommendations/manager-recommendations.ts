import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-manager-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-recommendations.html',
  styleUrl: './manager-recommendations.css'
})
export class ManagerRecommendations implements OnInit, OnDestroy {
  items: any[] = [];
  role = '';
  error = '';
  private sub?: Subscription;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return;

    let user: any;
    try { user = JSON.parse(stored); } catch { return; }

    this.role = user.role || '';

    this.sub = interval(10000).pipe(
      startWith(0),
      switchMap(() =>
        this.http.get<any[]>(`http://localhost:5180/api/recommendations/for-user/${user.id}`))
    ).subscribe({
      next: data => {
        this.items = data;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: e => {
        this.error = typeof e.error === 'string' ? e.error : 'Could not load recommendations.';
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
