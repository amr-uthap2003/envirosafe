import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeLayout } from '../../employee-layout/employee-layout';

@Component({
  selector: 'app-submit-reading',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeLayout],
  templateUrl: './submit-reading.html',
  styleUrl: './submit-reading.css'
})
export class SubmitReading {

  airQuality: number | null = null;
  waterPh: number | null = null;
  noiseLevel: number | null = null;
  temperature: number | null = null;
  wasteDisposal: 'Proper' | 'Improper' = 'Proper';
  notes = '';

  constructor(private router: Router) { }

  submit(): void {
    if (this.airQuality === null || this.waterPh === null || this.noiseLevel === null || this.temperature === null) {
      alert('Please fill in all required readings before submitting.');
      return;
    }

    // TODO: replace with POST /api/environmental-readings once your backend endpoint exists
    console.log('Submitting reading:', {
      airQuality: this.airQuality,
      waterPh: this.waterPh,
      noiseLevel: this.noiseLevel,
      temperature: this.temperature,
      wasteDisposal: this.wasteDisposal,
      notes: this.notes,
      submittedAt: new Date().toISOString()
    });

    alert('Reading submitted successfully!');
    this.router.navigate(['/my-submissions']);
  }
}
