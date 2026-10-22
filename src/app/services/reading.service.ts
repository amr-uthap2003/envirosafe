import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReadingRequest {
  userId: number;
  airQuality: number;
  waterPh: number;
  noiseLevel: number;
  temperature: number;
  wasteDisposal: 'Proper' | 'Improper';
  notes?: string;
}

export interface EnvironmentalReading {
  id: number;
  airQuality: number;
  waterPh: number;
  noiseLevel: number;
  temperature: number;
  wasteDisposal: string;
  notes: string;
  submittedAt: string;
  submittedByUserId: number;
  submittedByName: string;
  submittedByRole: string;   // NEW
}

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private baseUrl = 'http://localhost:5180/api/environmentalreadings';

  constructor(private http: HttpClient) { }

  submitReading(reading: CreateReadingRequest): Observable<EnvironmentalReading> {
    return this.http.post<EnvironmentalReading>(this.baseUrl, reading);
  }

  getMySubmissions(userId: number): Observable<EnvironmentalReading[]> {
    return this.http.get<EnvironmentalReading[]>(`${this.baseUrl}?userId=${userId}`);
  }

  // Used by the admin dashboard to detect new submissions
  getAllReadings(): Observable<EnvironmentalReading[]> {
    return this.http.get<EnvironmentalReading[]>(this.baseUrl);
  }
}
