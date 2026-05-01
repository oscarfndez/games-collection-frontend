import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="card login-card">
        <h1>Acceso al sistema</h1>
        <p class="muted">Introduce tu email y contraseña para obtener el JWT.</p>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="usuario@dominio.com" />
          </div>

          <div class="form-field">
            <label for="password">Contraseña</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" />
          </div>

          <div *ngIf="errorMessage" class="status-error">{{ errorMessage }}</div>

          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `
})

export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.signin(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl') ?? '/collection';
        this.router.navigateByUrl(redirectUrl);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message ?? 'No se pudo iniciar sesión. Revisa tus credenciales.';
      }
    });
  }


}
