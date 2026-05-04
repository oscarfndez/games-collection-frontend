import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="login-wrapper">
      <div class="card login-card">
        <h1>{{ 'pages.login.title' | translate }}</h1>
        <p class="muted">{{ 'pages.login.subtitle' | translate }}</p>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="email">{{ 'common.email' | translate }}</label>
            <input id="email" type="email" formControlName="email" [placeholder]="'pages.login.emailPlaceholder' | translate" />
          </div>

          <div class="form-field">
            <label for="password">{{ 'common.password' | translate }}</label>
            <input id="password" type="password" formControlName="password" placeholder="********" />
          </div>

          <div *ngIf="errorMessage" class="status-error">{{ errorMessage }}</div>

          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
            {{ (loading ? 'pages.login.loading' : 'pages.login.submit') | translate }}
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
  private readonly i18nService = inject(I18nService);

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
        this.errorMessage = error?.error?.message ?? this.i18nService.translate('pages.login.error');
      }
    });
  }
}
