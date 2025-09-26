import { Component, inject, signal, OnDestroy } from '@angular/core';
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

import { Subject, takeUntil, finalize } from 'rxjs';

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
export default class LoginComponent implements OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

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
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['/home']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);

            // Mostra messaggio di successo
            this.snackBar.open('Accesso effettuato con successo!', 'Chiudi', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });

            // Reindirizza alla pagina richiesta o alla home
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            console.log('Redirecting to:', returnUrl);
            this.router.navigate([returnUrl]);
          },
          error: (error: any) => {
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
          }
        });
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