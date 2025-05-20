import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import {Appointment, TreatmentRequestDto} from '../models/appointment.model';

interface SubmitTreatmentRequest {
  appointmentId: number;
  diagnosis: string;
  prescription: string;
}

export interface RecentTreatment {
  id: number;
  patientName: string;
  treatmentDate: string;
  description: string;
}

export interface DoctorDashboard {
  doctorName: any;
  name: string;
  appointmentsToday: number;
  pendingValidations: number;
  recentTreatments: RecentTreatment[];
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:8901/api';
  private refreshDashboardSource = new Subject<void>();
  refreshDashboard$ = this.refreshDashboardSource.asObservable();

  constructor(private http: HttpClient) {}

  // In doctor.service.ts
private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'x-doctor-email': localStorage.getItem('email') || '',
    'Authorization': `Bearer ${token}`
  });
}

getDoctorDashboard(): Observable<DoctorDashboard> {
  return this.http.get<DoctorDashboard>(`${this.apiUrl}/doctor/dashboard`, {
    headers: this.getHeaders()
  });
}

  getAppointments(): Observable<Appointment[]> {
    const doctorEmail = localStorage.getItem('email');
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/appointments?doctorEmail=${doctorEmail}`, {
      headers: this.getHeaders()
    });
  }

  validateAppointment(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(
      `${this.apiUrl}/doctor/appointments/${appointmentId}/validate`, 
      {}, 
      { headers }
    );
  }

  getAppointmentInfo(appointmentId: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/doctor/appointments/${appointmentId}`, {
      headers: this.getHeaders()
    });
  }

submitTreatment(requestBody: TreatmentRequestDto): Observable<any> {
  const headers = this.getHeaders();
  
  return this.http.post<any>(
    `${this.apiUrl}/doctor/treatments`,
    {
      appointmentId: requestBody.appointmentId,
      appointmentDate: requestBody.appointmentDate,
      diagnosis: requestBody.diagnosis,
      prescription: requestBody.prescription,
      doctorEmail: requestBody.doctorEmail,
      patientEmail: requestBody.patientEmail
    },
    { headers }
  ).pipe(
    tap(() => this.triggerDashboardRefresh())
  );
}

  triggerDashboardRefresh(): void {
    this.refreshDashboardSource.next();
  }
}