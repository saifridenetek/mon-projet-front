import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], // Changed from email to username
      password: ['', Validators.required]
    });
  }

  
   // In login.component.ts
login(): void {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('username', response.username);
        
        // Handle roles - make sure this matches your backend response
        const role = response.roles?.[0] || response.role;
        if (role) {
          localStorage.setItem('role', role);
        }

        // Navigate based on role - case insensitive comparison
        if (role && role.toLowerCase() === 'doctor') {
          this.router.navigate(['/doctor/dashboard']);
        } else {
          this.router.navigate(['/patient/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Login failed. Please check your username and password.');
      }
    });
  }
}
}