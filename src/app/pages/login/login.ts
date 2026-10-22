import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {

  username = '';
  email = '';
  password = '';

  usernameError = '';
  emailError = '';
  passwordError = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) { }


  // ==========================================
  // GOOGLE SCRIPT
  // ==========================================

  ngAfterViewInit(): void {
    this.loadGoogleScript();
  }

  loadGoogleScript() {

    // Check if Google script is already loaded
    if (typeof google !== 'undefined') {

      this.loadGoogleLogin();

      return;
    }

    // Create Google Identity Services script
    const script = document.createElement('script');

    script.src =
      'https://accounts.google.com/gsi/client';

    script.async = true;
    script.defer = true;

    // Script loaded successfully
    script.onload = () => {

      console.log(
        'Google Identity Services loaded.'
      );

      this.loadGoogleLogin();
    };

    // Script loading failed
    script.onerror = () => {

      console.error(
        'Failed to load Google Identity Services.'
      );

    };

    document.head.appendChild(script);
  }


  // ==========================================
  // INITIALIZE GOOGLE LOGIN
  // ==========================================

  loadGoogleLogin() {

    if (typeof google === 'undefined') {

      console.error(
        'Google Identity Services script is not loaded.'
      );

      return;
    }

    google.accounts.id.initialize({

      client_id:
        '798621592446-tlt6iaugap6iccur24ljnbiqpd0kldjo.apps.googleusercontent.com',

      callback: (response: any) => {

        this.handleGoogleLogin(response);

      }

    });


    const googleButton =
      document.getElementById('googleButton');


    if (googleButton) {

      // Remove any old Google button
      googleButton.innerHTML = '';


      // Render Google button
      google.accounts.id.renderButton(

        googleButton,

        {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular'
        }

      );

    }
    else {

      console.error(
        'googleButton element not found.'
      );

    }

  }


  // ==========================================
  // USERNAME VALIDATION
  // ==========================================

  validateUsername() {

    if (!this.username) {

      this.usernameError =
        'Username is required';

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


  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  validateEmail() {

    if (!this.email) {

      this.emailError =
        'Email is required';

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


  // ==========================================
  // PASSWORD VALIDATION
  // ==========================================

  validatePassword() {

    if (!this.password) {

      this.passwordError =
        'Password is required';

      return;
    }


    if (this.password.length < 8) {

      this.passwordError =
        'Password must contain at least 8 characters';

      return;
    }


    this.passwordError = '';
  }


  // ==========================================
  // NORMAL LOGIN
  // ==========================================

  login() {

    // Validate username
    this.validateUsername();

    // Validate email
    this.validateEmail();

    // Validate password
    this.validatePassword();


    // Stop if there are validation errors
    if (
      this.usernameError ||
      this.emailError ||
      this.passwordError
    ) {

      return;
    }


    // Call normal login API
    this.userService.login({

      username: this.username,
      password: this.password

    }).subscribe({

      // ======================================
      // LOGIN SUCCESS
      // ======================================

      next: (response) => {

        alert(
          'Login Successful!'
        );

        this.saveUserAndNavigate(
          response
        );

      },


      // ======================================
      // LOGIN ERROR
      // ======================================

      error: (err: any) => {

        console.error(
          'Login error:',
          err
        );


        if (err.status === 401) {

          alert(
            'Invalid username or password.'
          );

        }
        else if (err.status === 0) {

          alert(
            'Cannot connect to backend. Make sure the ASP.NET Core API is running on port 5180.'
          );

        }
        else {

          alert(
            'Login failed. Please check your backend connection.'
          );

        }

      }

    });

  }


  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  handleGoogleLogin(response: any) {

    // Check Google response
    if (
      !response ||
      !response.credential
    ) {

      alert(
        'Google login failed.'
      );

      return;
    }


    console.log(
      'Google credential received.'
    );


    // Send Google credential to ASP.NET Core
    this.userService
      .googleLogin(
        response.credential
      )
      .subscribe({

        // ====================================
        // GOOGLE LOGIN SUCCESS
        // ====================================

        next: (user) => {

          console.log(
            'Google user:',
            user
          );


          alert(
            'Google Login Successful!'
          );


          this.saveUserAndNavigate(
            user
          );

        },


        // ====================================
        // GOOGLE LOGIN ERROR
        // ====================================

        error: (err: any) => {

          console.error(
            'Google login error:',
            err
          );


          console.error(
            'Status:',
            err.status
          );


          console.error(
            'Error body:',
            err.error
          );


          // 401 = Google credential problem
          if (err.status === 401) {

            alert(
              'Google authentication failed: ' +
              (
                err.error?.message ||
                'Invalid Google credential.'
              )
            );

          }


          // 500 = ASP.NET Core backend error
          else if (err.status === 500) {

            alert(
              'Backend error: ' +
              (
                err.error?.message ||
                'Google login failed.'
              )
            );


            console.error(
              'Backend error details:',
              err.error?.error
            );

          }


          // 0 = Angular cannot connect to API
          else if (err.status === 0) {

            alert(
              'Cannot connect to backend. Make sure ASP.NET Core API is running on port 5180.'
            );

          }


          // Other errors
          else {

            alert(
              'Google login failed. Status: ' +
              err.status +
              '\n' +
              (
                err.error?.message ||
                'Unknown error'
              )
            );

          }

        }

      });

  }


  // ==========================================
  // SAVE USER AND NAVIGATE
  // ==========================================

  private saveUserAndNavigate(
    response: any
  ) {

    // Save current user
    localStorage.setItem(

      'currentUser',

      JSON.stringify({

        id:
          response.id,

        fullName:
          response.fullName,

        username:
          response.username,

        email:
          response.email,

        phoneNumber:
          response.phoneNumber,

        role:
          response.role,

        assignedIndustryId:
          response.assignedIndustryId,

        assignedIndustryName:
          response.assignedIndustryName

      })

    );


    // ========================================
    // ROLE BASED DASHBOARD
    // ========================================

    switch (response.role) {


      case 'Admin':

        this.router.navigate([
          '/admin-dashboard'
        ]);

        break;


      case 'Employee':

        this.router.navigate([
          '/employee-dashboard'
        ]);

        break;


      case 'Inspector':

        this.router.navigate([
          '/inspector-dashboard'
        ]);

        break;


      case 'Industry Manager':

        this.router.navigate([
          '/industry-manager-dashboard'
        ]);

        break;


      default:

        this.router.navigate([
          '/industry-manager-dashboard'
        ]);

        break;

    }

  }

}
