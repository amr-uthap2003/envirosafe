import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EmployeeLayout } from '../../employee-layout/employee-layout';
import { ReadingService, CreateReadingRequest } from '../../services/reading.service';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-submit-reading',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeLayout],
  templateUrl: './submit-reading.html',
  styleUrl: './submit-reading.css'
})
export class SubmitReading implements OnInit, OnDestroy {

  airQuality: number | null = null;
  waterPh: number | null = null;
  noiseLevel: number | null = null;
  temperature: number | null = null;
  wasteDisposal: 'Proper' | 'Improper' = 'Proper';
  notes = '';

  // Shown at the top of the form, kept live via polling
  assignedIndustry = 'Not yet assigned';

  private userId: number | null = null;
  private pollIntervalMs = 2000;
  private pollSubscription?: Subscription;

  constructor(
    private router: Router,
    private readingService: ReadingService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    this.userId = user.id;

    // Initial load
    this.userService.getUser(this.userId!).subscribe({
      next: (data) => {
        this.assignedIndustry = data.assignedIndustryName || 'Not yet assigned';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load assigned industry:', err);
      }
    });

    // Keep it live while the form is open, same pattern as the dashboard
    this.pollSubscription = interval(this.pollIntervalMs)
      .pipe(switchMap(() => this.userService.getUser(this.userId!)))
      .subscribe({
        next: (data) => {
          this.assignedIndustry = data.assignedIndustryName || 'Not yet assigned';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Polling error:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  submit(): void {
    if (this.airQuality === null || this.waterPh === null || this.noiseLevel === null || this.temperature === null) {
      alert('Please fill in all required readings before submitting.');
      return;
    }

    const validationError = this.validateReadings();
    if (validationError) {
      alert(validationError);
      return;
    }

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      alert('You must be logged in to submit a reading.');
      return;
    }
    const user = JSON.parse(storedUser);

    const payload: CreateReadingRequest = {
      userId: user.id,
      airQuality: this.airQuality,
      waterPh: this.waterPh,
      noiseLevel: this.noiseLevel,
      temperature: this.temperature,
      wasteDisposal: this.wasteDisposal,
      notes: this.notes
    };

    this.readingService.submitReading(payload).subscribe({
      next: () => {
        alert('Reading submitted successfully!');
        this.router.navigate(['/my-submissions']);
      },
      error: (err) => {
        console.error('Submit failed:', err);
        alert('Failed to submit reading. Please try again.');
      }
    });
  }

  // Returns an error message if any value is physically implausible,
  // or null if everything passes.
  private validateReadings(): string | null {
    // Air Quality Index: standard scale is 0-500
    if (this.airQuality! < 0 || this.airQuality! > 500) {
      return 'Air Quality must be between 0 and 500 (AQI scale).';
    }

    // pH scale is strictly 0-14
    if (this.waterPh! < 0 || this.waterPh! > 14) {
      return 'Water pH must be between 0 and 14.';
    }

    // Noise level in dB: 0 is silence, 194 is theoretical max in air
    if (this.noiseLevel! < 0 || this.noiseLevel! > 194) {
      return 'Noise level must be between 0 and 194 dB.';
    }

    // Reasonable industrial temperature range in Celsius
    if (this.temperature! < -50 || this.temperature! > 150) {
      return 'Temperature must be between -50°C and 150°C.';
    }

    return null;
  }
}
