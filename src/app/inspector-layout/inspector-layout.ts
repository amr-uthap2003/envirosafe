import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-inspector-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './inspector-layout.html',
  styleUrl: './inspector-layout.css'
})
export class InspectorLayout {

  constructor(private router: Router) { }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
