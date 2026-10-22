import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IndustryModel {
  id: number;
  name: string;
  location: string;
  type: string;
  manager: string;
  status: 'Active' | 'Inactive';
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface AddIndustryRequest {
  name: string;
  location: string;
  type: string;
  manager: string;
  status: 'Active' | 'Inactive';
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review';
  riskLevel: 'Low' | 'Medium' | 'High';
}

@Injectable({
  providedIn: 'root'
})
export class IndustryService {

  private baseUrl = 'http://localhost:5180/api/Industries';

  constructor(private http: HttpClient) { }

  getAllIndustries(): Observable<IndustryModel[]> {
    return this.http.get<IndustryModel[]>(`${this.baseUrl}`);
  }

  addIndustry(data: AddIndustryRequest): Observable<IndustryModel> {
    return this.http.post<IndustryModel>(`${this.baseUrl}`, data);
  }

  deleteIndustry(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
