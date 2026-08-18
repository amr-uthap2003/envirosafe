import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  email = '';
  password = '';

  usernameError = '';
  emailError = '';
  passwordError = '';

  constructor(private router: Router, private userService: UserService) { }

  validateUsername() {
    if (!this.username) {
      this.usernameError = 'Username is required';
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(this.username)) {
      this.usernameError = 'Username can contain letters and numbers only';
      return;
    }
    if (this.username.length < 4) {
      this.usernameError = 'Username must contain at least 4 characters';
      return;
    }
    this.usernameError = '';
  }

  validateEmail() {
    if (!this.email) {
      this.emailError = 'Email is required';
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.emailError = 'Enter a valid email like abc@gmail.com';
      return;
    }
    this.emailError = '';
  }

  validatePassword() {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return;
    }
    if (this.password.length < 8) {
      this.passwordError = 'Password must contain at least 8 characters';
      return;
    }
    this.passwordError = '';
  }

  login() {
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();

    if (this.usernameError || this.emailError || this.passwordError) {
      return;
    }

    this.userService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        alert('Login Successful!');

        switch (response.role) {
          case 'Admin':
            this.router.navigate(['/admin-dashboard']);
            break;
          case 'Employee':
            this.router.navigate(['/employee-dashboard']);
            break;
          case 'Inspector':
            this.router.navigate(['/inspector-dashboard']);
            break;
          case 'Industry Manager':
            this.router.navigate(['/industry-manager-dashboard']);
            break;
          default:
            this.router.navigate(['/industry-manager-dashboard']);
        }
      },
      error: (err: any) => {
        if (err.status === 401) {
          alert('Invalid username or password.');
        } else {
          alert('Login failed. Please check your backend connection.');
        }
        console.error('Login error:', err);
      }
    });
  }

}
s
