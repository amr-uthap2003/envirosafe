import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  fullName = '';
  username = '';
  email = '';
  phoneNumber = '';
  role = '';
  password = '';
  confirmPassword = '';

  fullNameError = '';
  usernameError = '';
  emailError = '';
  phoneError = '';

  constructor(private router: Router, private userService: UserService) { }

  // =========================
  // FULL NAME
  // =========================
  validateFullName() {

    if (!this.fullName) {
      this.fullNameError = 'Full name is required';
      return;
    }

    if (!/^[A-Za-z ]+$/.test(this.fullName)) {
      this.fullNameError =
        'Name can contain letters and spaces only';
      return;
    }

    if (this.fullName.trim().length < 3) {
      this.fullNameError =
        'Name must contain at least 3 characters';
      return;
    }

    this.fullNameError = '';
  }


  // =========================
  // USERNAME
  // =========================
  validateUsername() {

    if (!this.username) {
      this.usernameError = 'Username is required';
      return;
    }

    if (!/^[A-Za-z0-9]+$/.test(this.username)) {
      this.usernameError =
        'Username can contain letters and numbers only';
      return;
    }

    if (this.username.length < 4) {
      this.usernameError =
        'Username must contain at least 4 characters';
      return;
    }

    this.usernameError = '';
  }


  // =========================
  // EMAIL
  // =========================
  validateEmail() {

    if (!this.email) {
      this.emailError = 'Email is required';
      return;
    }

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(this.email)) {
      this.emailError =
        'Enter a valid email like abc@gmail.com';
      return;
    }

    this.emailError = '';
  }


  // =========================
  // PHONE
  // =========================
  validatePhone() {

    if (!this.phoneNumber) {
      this.phoneError = 'Phone number is required';
      return;
    }

    if (!/^[0-9]+$/.test(this.phoneNumber)) {
      this.phoneError =
        'Phone number can contain numbers only';
      return;
    }

    if (this.phoneNumber.length !== 10) {
      this.phoneError =
        'Phone number must contain exactly 10 digits';
      return;
    }

    this.phoneError = '';
  }


  // =========================
  // PASSWORD CONDITIONS
  // =========================

  get passwordLengthValid(): boolean {
    return this.password.length >= 8;
  }

  get passwordUppercaseValid(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get passwordLowercaseValid(): boolean {
    return /[a-z]/.test(this.password);
  }

  get passwordNumberValid(): boolean {
    return /[0-9]/.test(this.password);
  }

  get passwordSpecialValid(): boolean {
    return /[^A-Za-z0-9]/.test(this.password);
  }


  // =========================
  // PASSWORD
  // =========================

  passwordError = '';

  validatePassword() {

    if (!this.password) {
      this.passwordError = 'Password is required';
    } else if (
      !this.passwordLengthValid ||
      !this.passwordUppercaseValid ||
      !this.passwordLowercaseValid ||
      !this.passwordNumberValid ||
      !this.passwordSpecialValid
    ) {
      this.passwordError =
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';
    } else {
      this.passwordError = '';
    }

    this.validateConfirmPassword();
  }


  // =========================
  // CONFIRM PASSWORD
  // =========================

  confirmPasswordError = '';

  validateConfirmPassword() {

    if (!this.confirmPassword) {
      this.confirmPasswordError =
        'Confirm password is required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError =
        'Passwords do not match';
      return;
    }

    this.confirmPasswordError = '';
  }


  // =========================
  // REGISTER
  // =========================

  register() {

    this.validateFullName();
    this.validateUsername();
    this.validateEmail();
    this.validatePhone();
    this.validatePassword();
    this.validateConfirmPassword();

    const passwordValid =
      this.passwordLengthValid &&
      this.passwordUppercaseValid &&
      this.passwordLowercaseValid &&
      this.passwordNumberValid &&
      this.passwordSpecialValid;

    if (
      this.fullNameError ||
      this.usernameError ||
      this.emailError ||
      this.phoneError ||
      !this.role ||
      !passwordValid ||
      this.confirmPasswordError
    ) {
      return;
    }

    this.userService.register({
      fullName: this.fullName,
      username: this.username,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password,
      role: this.role
    }).subscribe({
      next: (response) => {
        alert('Registration Successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 400 && err.error?.message) {
          alert(err.error.message);
        } else {
          alert('Registration failed. Please check your backend connection.');
        }
        console.error('Registration error:', err);
      }
    });
  }
}
