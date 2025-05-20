import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../models/doctor.model';
import { Appointment } from '../models/appointment.model';
import { Treatment } from '../models/treatment.model';
import { PatientDashboard } from '../models/patient-dashboard.model';

export interface CreateAppointmentRequest {
  patientEmail: string;
  doctorEmail: string;
  dateTime: string; // format: "2025-03-31T10:10"
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8901/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-patient-email': localStorage.getItem('email') || '',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  getPatientDashboard(): Observable<PatientDashboard> {
    return this.http.get<PatientDashboard>(`${this.apiUrl}/patient/dashboard`, {
      headers: this.getHeaders() });
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`, {
      headers: this.getHeaders() });
  }

  createAppointment(appointment: CreateAppointmentRequest): Observable<{ message: string, appointmentId: number }> {
    return this.http.post<{ message: string, appointmentId: number }>(
        `${this.apiUrl}/appointments`,
        appointment, {
          headers: this.getHeaders()
        });
  }

  getPatientTreatments(): Observable<Treatment[]> {
    const patientEmail = localStorage.getItem('email');
    return this.http.get<Treatment[]>(
      `${this.apiUrl}/patient/treatments/${patientEmail}`,
        {
          headers: this.getHeaders() });
  }
}