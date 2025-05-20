import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../services/patient.service';
import { Treatment } from '../../../models/treatment.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-treatment-files',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './treatment-files.component.html',
  styleUrls: ['./treatment-files.component.css']
})
export class TreatmentFilesComponent implements OnInit {
  treatments: Treatment[] = [];

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.getTreatments();
  }

  getTreatments(): void {
    this.patientService.getPatientTreatments().subscribe(
      (data: Treatment[]) => {
        this.treatments = data;
      },
      error => {
        console.error('Error fetching treatments:', error);
      }
    );
  }

  // Optional: Implement download/print functionality here if needed
  downloadTreatment(treatment: Treatment): void {
    console.log('Downloading treatment:', treatment);
    // Add logic for downloading or printing
  }
}