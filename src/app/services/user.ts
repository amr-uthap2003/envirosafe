import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  id: number;
  fullName: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  assignedIndustryId?: number | null;
  assignedIndustryName?: string | null;
}

export interface GoogleLoginRequest {
  credential: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:5180/api/Users';

  constructor(private http: HttpClient) { }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      data
    );
  }

  googleLogin(credential: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/google-login`,
      {
        credential: credential
      }
    );
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getUser(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  updateUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${userId}/role`,
      { role: newRole }
    );
  }

  updateUserIndustry(
    userId: number,
    industryId: number | null
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${userId}/industry`,
      { industryId }
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userId}`);
  }
}
