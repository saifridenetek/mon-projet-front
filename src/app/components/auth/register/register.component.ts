import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  roles = ['PATIENT', 'DOCTOR'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      role: ['PATIENT', Validators.required], // Default role to PATIENT
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  signup() {
    if (this.registerForm.valid) {
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.authService.signup(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('registerForm:', this.registerForm.value);
        console.log('Registration successful:', response);
        alert('Registration successful!');
        this.router.navigate(['/signin']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        alert(`Registration failed: ${error.message}`);
      }
    });
  }
}
}