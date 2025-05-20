import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Doctor } from '../../../models/doctor.model';
import { PatientService } from '../../../services/patient.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-form',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  doctors: Doctor[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
  doctorEmail: ['', Validators.required], // Utilisez doctorEmail ici
  appointmentDate: ['', Validators.required],
  appointmentTime: ['', Validators.required],
  reason: ['', Validators.required]
});
  }

   ngOnInit(): void {
    // Initialiser le formulaire
    this.appointmentForm = this.fb.group({
      doctorEmail: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      reason: ['', Validators.required]
    });

    // Charger la liste des docteurs
    this.loadDoctors();
  }

    loadDoctors(): void {
    this.patientService.getDoctors().subscribe((data: Doctor[]) => {
      this.doctors = data; // Stocker les docteurs récupérés
    });
  }

 onSubmit(): void {
  if (this.appointmentForm.valid) {
    const { doctorEmail, appointmentDate, appointmentTime, reason } = this.appointmentForm.value;
    const patientEmail = localStorage.getItem('email') || '';

      const dateTime = `${appointmentDate}T${appointmentTime}`;
    // PREMIER APPEL (création du premier rendez-vous)
      this.patientService.createAppointment({
          patientEmail: patientEmail,
          doctorEmail: doctorEmail,
          dateTime: dateTime,
          reason: reason
      }).subscribe(
      (response) => {
        console.log('Appointment created:', response);
        this.router.navigate(['/patient/dashboard']);
      },
      (error) => {
        console.error('Error creating appointment:', error);
      }
    );
  }}
  onCancel(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}