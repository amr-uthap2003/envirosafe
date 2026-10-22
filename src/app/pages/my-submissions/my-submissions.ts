import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import { EmployeeLayout } from '../../employee-layout/employee-layout';
import { ReadingService, EnvironmentalReading } from '../../services/reading.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, EmployeeLayout],
  templateUrl: './my-submissions.html',
  styleUrl: './my-submissions.css'
})
export class MySubmissions implements OnInit {

  submissions: EnvironmentalReading[] = [];
  loading = true;

  constructor(private readingService: ReadingService) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      this.loading = false;
      return;
    }
    const user = JSON.parse(storedUser);

    this.readingService.getMySubmissions(user.id).subscribe({
      next: (data) => {
        this.submissions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load submissions:', err);
        this.loading = false;
      }
    });
  }

  disposalClass(status: string): string {
    return status === 'Proper' ? 'badge-good' : 'badge-bad';
  }

  // Generates a one-page PDF report for a single reading and
  // triggers a browser download — same format as the admin download.
  downloadReadingReport(reading: EnvironmentalReading): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Environmental Reading Report', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('EnviroSafe Compliance Monitoring', 14, 27);

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    const rows: [string, string][] = [
      ['Submitted By', reading.submittedByName],
      ['Submitted At', new Date(reading.submittedAt).toLocaleString()],
      ['Air Quality (AQI)', String(reading.airQuality)],
      ['Water pH', String(reading.waterPh)],
      ['Noise Level (dB)', String(reading.noiseLevel)],
      ['Temperature (°C)', String(reading.temperature)],
      ['Waste Disposal', reading.wasteDisposal],
      ['Notes', reading.notes || '—']
    ];

    let y = 45;
    doc.setFontSize(12);
    doc.setTextColor(0);

    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, y);
      y += 10;
    }

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 285);

    const safeName = reading.submittedByName.replace(/[^a-z0-9]/gi, '_');
    doc.save(`reading-report-${safeName}-${reading.id}.pdf`);
  }
}
