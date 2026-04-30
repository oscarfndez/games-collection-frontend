import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto, UserService } from '../../core/user.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>Modificar usuario</h1>
        <p class="muted">Actualiza los datos básicos del usuario.</p>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="firstName">Nombre</label>
            <input id="firstName" type="text" formControlName="first_name" />
          </div>

          <div class="form-field">
            <label for="lastName">Apellidos</label>
            <input id="lastName" type="text" formControlName="last_name" />
          </div>

          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" />
          </div>

          <div class="form-field">
            <label for="role">Rol</label>
            <select id="role" formControlName="role">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div *ngIf="errorMessage" class="status-error">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="status-success">{{ successMessage }}</div>

          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="goBack()">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  private userId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['USER', [Validators.required]]
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (!this.userId) {
      this.errorMessage = 'No se ha indicado el identificador del usuario.';
      return;
    }

    this.loadUser(this.userId);
  }

  loadUser(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos del usuario.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid || !this.userId) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UserDto = this.form.getRawValue();
    this.userService.update(this.userId, payload).subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = 'Usuario actualizado correctamente.';
        this.router.navigate(['/users', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo guardar el usuario.';
      }
    });
  }

  goBack(): void {
    if (this.userId) {
      this.router.navigate(['/users', this.userId]);
      return;
    }

    this.router.navigate(['/users']);
  }
}
