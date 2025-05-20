import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../services/patient.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {
  patientName: string | null = null;
  upcomingAppointments: Appointment[] = [];

  constructor(
    private patientService: PatientService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  // First get the username from local storage
  this.patientName = this.authService.getUsername();
  
  console.log('Patient name from auth:', this.patientName); // Debug log

  // Then load dashboard data
  this.patientService.getPatientDashboard().subscribe({
    next: (data) => {
      if (data) {
        // Use data.name if available, otherwise fall back to the username
        this.patientName = data.name || this.patientName;
        this.upcomingAppointments = data.upcomingAppointments || [];
        
        console.log('Dashboard data:', data); // Debug log
      }
    },
    error: (err) => {
      console.error('Error loading dashboard:', err);
    }
  });
}
  onBookAppointment(): void {
    this.router.navigate(['/patient/appointments/new']);
  }

  onViewTreatments(): void {
    this.router.navigate(['/patient/treatments']);
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name'); // Supprime également le nom de l'utilisateur
    this.router.navigate(['/signin']);
  }
}