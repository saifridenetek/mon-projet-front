import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService, RecentTreatment } from '../../../services/doctor.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service'; // Ajouter cette importation

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true, // Ajouter cette ligne si vous utilisez Angular 14+
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  welcomeMessage: string = 'Welcome, Doctor!';
  totalAppointmentsToday: number = 0;
  pendingValidations: number = 0;
  recentTreatments: RecentTreatment[] = [];
  private refreshSub!: Subscription;

  constructor(
    private router: Router, 
    private doctorService: DoctorService,
    private authService: AuthService // Ajouter AuthService
  ) { }

  ngOnInit(): void {
    // Récupérer le nom du docteur depuis le local storage ou AuthService
    const doctorName = this.authService.getUsername() || localStorage.getItem('name');
    if (doctorName) {
      this.welcomeMessage = `Welcome, ${doctorName}!`;
    }
    
    this.loadDashboardData();
    
    this.refreshSub = this.doctorService.refreshDashboard$.subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

 loadDashboardData(): void {
  // Récupérer le nom depuis le local storage d'abord
  const doctorName = this.authService.getUsername() || localStorage.getItem('name') || 'Doctor';
  this.welcomeMessage = `Welcome, ${doctorName}!`;

  // Charger les autres données
  this.doctorService.getDoctorDashboard().subscribe({
    next: (data) => {
      this.totalAppointmentsToday = data.appointmentsToday;
      this.pendingValidations = data.pendingValidations;
      this.recentTreatments = data.recentTreatments;
    },
    error: (error) => {
      console.error('Error fetching doctor dashboard data:', error);
    }
  });
}

  viewAppointmentsList(): void {
    // Navigate to appointments page
    this.router.navigate(['/doctor/appointments']);
  }

  viewPatient(): void {
    // Navigate to patient treatment files page
    this.router.navigate(['/doctor/patients']);
  }

  logout(): void {
    // Handle logout logic (clear session, navigate to login)
    console.log('Doctor logged out');
    this.router.navigate(['/signin']);
  }
}