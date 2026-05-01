import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto, UserService } from '../../core/user.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ isEditMode ? 'Modificar usuario' : 'Crear usuario' }}</h1>
        <p class="muted">
          {{ isEditMode ? 'Actualiza los datos básicos del usuario.' : 'Introduce los datos del nuevo usuario.' }}
        </p>

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

          <div class="form-field" *ngIf="!isEditMode">
            <label for="password">Contraseña</label>
            <input id="password" type="password" formControlName="password" />
          </div>

          <div class="form-field">
            <label for="role">Rol</label>
            <select id="role" formControlName="role">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div class="form-field">
            <label for="photo">Foto de usuario</label>
            <input id="photo" type="file" accept="image/*" (change)="onPhotoSelected($event)" />
          </div>

          <div class="form-field">
            <label>Vista previa</label>
            <div style="margin-top: 8px;">
              <img
                [src]="photoPreviewUrl"
                alt="Vista previa de la foto del usuario"
                style="width: 140px; height: 140px; object-fit: cover; border-radius: 999px; border: 1px solid #d0d7e2;"
              />
            </div>
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
export class UserFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  private userId: string | null = null;
  isEditMode = false;
  selectedPhoto?: File;
  photoPreviewUrl = 'assets/images/profile.png';
  private objectUrl?: string;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['USER', [Validators.required]]
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    const id = this.userId;
    this.isEditMode = !!id;

    if (!this.isEditMode) {
      this.form.controls.password.addValidators(Validators.required);
      this.form.controls.password.updateValueAndValidity();
      return;
    }

    if (!id) {
      return;
    }

    this.loadUser(id);
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
        this.loadPhoto(user);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos del usuario.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.selectedPhoto = file;
    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl = this.objectUrl;
  }

  submit(): void {
    if (this.form.invalid || (this.isEditMode && !this.userId)) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UserDto = this.form.getRawValue();

    const request$ = this.isEditMode
      ? this.userService.update(this.userId!, payload, this.selectedPhoto)
      : this.userService.create(payload, this.selectedPhoto);

    request$.subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = this.isEditMode
          ? 'Usuario actualizado correctamente.'
          : 'Usuario creado correctamente.';
        this.router.navigate(['/users', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo guardar el usuario.';
      }
    });
  }

  goBack(): void {
    if (this.isEditMode && this.userId) {
      this.router.navigate(['/users', this.userId]);
      return;
    }

    this.router.navigate(['/users']);
  }

  private loadPhoto(user: UserDto): void {
    if (!user.id || !user.has_photo) {
      return;
    }

    this.userService.getPhoto(user.id).subscribe({
      next: (blob) => {
        this.revokeObjectUrl();
        this.objectUrl = URL.createObjectURL(blob);
        this.photoPreviewUrl = this.objectUrl;
      }
    });
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
  }
}
