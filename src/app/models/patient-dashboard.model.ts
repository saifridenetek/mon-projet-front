import { Appointment } from "./appointment.model";

export interface PatientDashboard {
    name: string;
    upcomingAppointments: Appointment[];
  }