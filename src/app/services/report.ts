import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportModel {
  id: number;
  industryId: number;
  reportType: string;
  description: string;
  reportDate: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  activeViolations: number;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  submittedByUserId: number;
  submittedByName: string;
}

export interface SubmitReportRequest {
  industryId: number;
  reportType: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  activeViolations: number;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  submittedByUserId: number;
  submittedByName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = 'http://localhost:5180/api/Reports';

  constructor(private http: HttpClient) { }

  getAllReports(): Observable<ReportModel[]> {
    return this.http.get<ReportModel[]>(`${this.baseUrl}`);
  }

  getReportsForIndustry(industryId: number): Observable<ReportModel[]> {
    return this.http.get<ReportModel[]>(`${this.baseUrl}/industry/${industryId}`);
  }

  submitReport(data: SubmitReportRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}
