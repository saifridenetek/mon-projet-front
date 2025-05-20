import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Appointment, TreatmentRequestDto} from '../../../models/appointment.model';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-treatment-form',
  imports: [ReactiveFormsModule,CommonModule, RouterModule],
  templateUrl: './treatment-form.component.html',
  styleUrls: ['./treatment-form.component.css']
})
export class TreatmentFormComponent implements OnInit {

  appointmentId: number | null = null;
  appointmentDetails: Appointment | undefined;
  treatmentForm!: FormGroup;
  isSubmitting!: boolean;
submitError: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private doctorService: DoctorService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('appointmentId');
    if (id) {
      this.appointmentId = +id; // Convert string ID from route to number
    }


    this.treatmentForm = this.fb.group({
      diagnosis: ['', Validators.required],
      prescription: ['', Validators.required]
    });

    if (this.appointmentId) {
      // Fetch appointment details using the ID
      this.doctorService.getAppointmentInfo(this.appointmentId).subscribe(
        (data: Appointment) => {
          this.appointmentDetails = data;
        },
        (error) => {
          console.error('Error fetching appointment details:', error);
          // Handle error, e.g., show an error message
        }
      );
    }
  }

  

  onSubmit(): void {
  if (this.treatmentForm.valid && this.appointmentId) {
    const treatmentData: TreatmentRequestDto = {
      appointmentId: this.appointmentId,
      appointmentDate: this.appointmentDetails?.dateTime!,
      diagnosis: this.treatmentForm.value.diagnosis,
      prescription: this.treatmentForm.value.prescription,
      doctorEmail: this.appointmentDetails?.doctorName!,
      patientEmail: this.appointmentDetails?.patientName!
    };
    console.log("treatmentData",treatmentData);
    console.log("this.appointmentDetails",this.appointmentDetails);

    this.doctorService.submitTreatment(treatmentData).subscribe({
      next: (response) => {
        console.log('Treatment submitted successfully', response);
        this.router.navigate(['/doctor/dashboard']);
      },
      error: (error) => {
        console.error('Error submitting treatment:', error);
        alert('Failed to submit treatment. Please try again.');
      }
    });
  }
}
  // Handle cancel button click
  onCancel(): void {
    this.router.navigate(['/doctor/appointments']);
  }

}