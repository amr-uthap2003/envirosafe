import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeLayout } from '../../employee-layout/employee-layout';

export interface SubmissionRecord {
  id: number;
  date: string;
  airQuality: number;
  waterPh: number;
  noiseLevel: number;
  temperature: number;
  wasteDisposal: 'Proper' | 'Improper';
}

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, EmployeeLayout],
  templateUrl: './my-submissions.html',
  styleUrl: './my-submissions.css'
})
export class MySubmissions {

  // TODO: replace with GET /api/environmental-readings?userId={currentUserId} once backend exists
  submissions: SubmissionRecord[] = [
    { id: 1, date: '2026-08-16 09:15 AM', airQuality: 85, waterPh: 7.2, noiseLevel: 68, temperature: 27, wasteDisposal: 'Proper' },
    { id: 2, date: '2026-08-15 02:40 PM', airQuality: 92, waterPh: 6.9, noiseLevel: 71, temperature: 28, wasteDisposal: 'Proper' },
    { id: 3, date: '2026-08-14 10:05 AM', airQuality: 140, waterPh: 6.1, noiseLevel: 79, temperature: 29, wasteDisposal: 'Improper' }
  ];

  disposalClass(status: string): string {
    return status === 'Proper' ? 'badge-good' : 'badge-bad';
  }
}
