import { Routes } from '@angular/router';
import { AuthGuard } from './components/core/auth.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'patient/dashboard',
    loadComponent: () => import('./components/patient/patient-dashboard/patient-dashboard.component')
    .then(m => m.PatientDashboardComponent),
    canActivate: [AuthGuard] // You can protect this route with an auth guard if needed
  },
  {
    path: 'patient/appointments/new',
    loadComponent: () => import('./components/patient/appointment-form/appointment-form.component')
    .then(m => m.AppointmentFormComponent),
    canActivate: [AuthGuard] // You can protect this route with an auth guard if needed
  },
  {
    path: 'patient/treatments',
    loadComponent: () => import('./components/patient/treatment-files/treatment-files.component')
    .then(m => m.TreatmentFilesComponent),
    canActivate: [AuthGuard] // You can protect this route with an auth guard if needed
  },
  {
    path: 'doctor/dashboard',
    loadComponent: () => import('./components/doctor/doctor-dashboard/doctor-dashboard.component')
    .then(m => m.DoctorDashboardComponent),
    canActivate: [AuthGuard] // You can protect this route with an auth guard if needed
  },
  {
    path: 'doctor/appointments',
    loadComponent: () => import('./components/doctor/appointments-list/appointments-list.component')
    .then(m => m.AppointmentsListComponent),
    canActivate: [AuthGuard] // You can protect this route with an auth guard if needed
  },
  {
    path: 'doctor/treatments/new',
    loadComponent: () => import('./components/doctor/treatment-form/treatment-form.component')
    .then(m => m.TreatmentFormComponent),
    canActivate: [AuthGuard] // You can protect this route with an auth guard if needed
  },
  {
    path: '**',
    redirectTo: 'signin'
  }
];