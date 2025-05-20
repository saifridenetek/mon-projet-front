import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Appointment } from '../../../models/appointment.model';
import { DoctorService } from '../../../services/doctor.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.css']
})
export class AppointmentsListComponent implements OnInit {
  currentPage: number = 1;
  itemsPerPage: number = 5;

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  paginatedAppointments: Appointment[] = [];
  selectedStatus: string = 'All';
  isLoading: boolean = false;
successMessage: any;

  constructor(private doctorService: DoctorService, private router: Router) {}

  ngOnInit(): void {
    this.fetchAppointments();
  }

 fetchAppointments(): void {
  this.isLoading = true;
  this.doctorService.getAppointments().subscribe({
    next: (data: any[]) => {
      this.appointments = data.map(appt => ({
        id: appt.id,
        patientEmail: appt.patientEmail || appt.email || 'unknown@example.com',
        patientName: appt.patientName || appt.patientName2 || 'Unknown',
        doctorName: appt.doctorName || appt.doctorName2 || 'Unknown',
        dateTime: appt.dateTime || appt.appointmentDateTime || appt.datetime,
        reason: appt.reason,
        status: appt.status || appt.status2 || 'PENDING'
      })).filter(appt => appt.dateTime); // filter out invalid appointments
      
      this.applyFilter();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error fetching appointments:', error);
      this.appointments = [];
      this.applyFilter();
      this.isLoading = false;
    }
  });
}

  applyFilter(): void {
    this.filteredAppointments = this.selectedStatus === 'All'
      ? [...this.appointments]
      : this.appointments.filter(appt => appt.status === this.selectedStatus);
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedAppointments = this.filteredAppointments.slice(start, end);
  }

  nextPage(): void {
    if ((this.currentPage * this.itemsPerPage) < this.filteredAppointments.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  validateAppointment(appointmentId: number | undefined): void {
  if (appointmentId !== undefined) {
    this.isLoading = true;
    this.doctorService.validateAppointment(appointmentId).subscribe({
      next: (response) => {
        console.log('Appointment validated:', response);
        
        // Solution 1: Recharger les données
        this.fetchAppointments();
        
        // Solution 2: Mise à jour locale immédiate (plus rapide)
        const index = this.appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
          this.appointments[index].status = 'VALIDATED';
          this.applyFilter();
        }
        
        this.isLoading = false;
        
        // Optionnel: Notification de succès
        alert('Rendez-vous validé avec succès!');
      },
      error: (error) => {
        console.error('Error validating appointment:', error);
        this.isLoading = false;
        alert('Erreur lors de la validation du rendez-vous');
      }
    });
  }
}

  fillTreatmentFile(appointmentId: number | undefined): void {
    if (appointmentId !== undefined) {
      this.router.navigate(['/doctor/treatments/new'], {
        queryParams: { appointmentId }
      });
    }
  }
}