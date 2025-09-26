import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../auth.service';
import { LoginRequest } from '../models/login-request.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Signals
  protected hidePassword = signal(true);
  protected isLoading = signal(false);
  protected errorMessage = signal<string>('');

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required]],
      password: ['Admin123!', [Validators.required]],
      rememberMe: [false]
    });

    // Se già autenticato, reindirizza
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      try {
        const loginData: LoginRequest = this.loginForm.value;
        await this.authService.login(loginData);

        // Mostra messaggio di successo
        this.snackBar.open('Accesso effettuato con successo!', 'Chiudi', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Reindirizza alla pagina richiesta o alla dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);

      } catch (error: any) {
        console.error('Errore durante il login:', error);

        let errorMsg = 'Errore durante l\'accesso';
        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }

        this.errorMessage.set(errorMsg);
        this.snackBar.open(errorMsg, 'Chiudi', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

}