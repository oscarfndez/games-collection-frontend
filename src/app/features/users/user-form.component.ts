import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { UserDto, UserService } from '../../core/user.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ (isEditMode ? 'pages.users.editTitle' : 'pages.users.createTitle') | translate }}</h1>
        <p class="muted">
          {{ (isEditMode ? 'pages.users.editSubtitle' : 'pages.users.createSubtitle') | translate }}
        </p>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="firstName">{{ 'common.firstName' | translate }}</label>
            <input id="firstName" type="text" formControlName="first_name" />
          </div>

          <div class="form-field">
            <label for="lastName">{{ 'common.lastName' | translate }}</label>
            <input id="lastName" type="text" formControlName="last_name" />
          </div>

          <div class="form-field">
            <label for="email">{{ 'common.email' | translate }}</label>
            <input id="email" type="email" formControlName="email" />
          </div>

          <div class="form-field" *ngIf="!isEditMode">
            <label for="password">{{ 'pages.users.password' | translate }}</label>
            <input id="password" type="password" formControlName="password" />
          </div>

          <div class="form-field">
            <label for="role">{{ 'common.role' | translate }}</label>
            <select id="role" formControlName="role">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div class="form-field">
            <label for="photo">{{ 'pages.users.photoField' | translate }}</label>
            <div class="file-picker">
              <input
                id="photo"
                class="file-picker__input"
                type="file"
                accept="image/*"
                (change)="onPhotoSelected($event)"
              />
              <label class="btn btn-secondary file-picker__button" for="photo">
                {{ 'pages.users.selectPhoto' | translate }}
              </label>
              <span class="file-picker__filename">{{ selectedPhotoName }}</span>
            </div>
          </div>

          <div class="form-field">
            <label>{{ 'pages.users.preview' | translate }}</label>
            <div style="margin-top: 8px;">
              <img
                [src]="photoPreviewUrl"
                [alt]="'pages.users.photoPreviewAlt' | translate"
                style="width: 140px; height: 140px; object-fit: cover; border-radius: 999px; border: 1px solid #d0d7e2;"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="status-error">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="status-success">{{ successMessage }}</div>

          <div class="actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading">
              {{ (loading ? 'common.loadingSave' : 'common.save') | translate }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="goBack()">{{ 'common.cancel' | translate }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .file-picker {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }

    .file-picker__input {
      height: 1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      width: 1px;
    }

    .file-picker__button {
      cursor: pointer;
      margin: 0;
    }

    .file-picker__filename {
      color: #64748b;
      font-size: 0.95rem;
    }
  `]
})
export class UserFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly i18nService = inject(I18nService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  private userId: string | null = null;
  isEditMode = false;
  selectedPhoto?: File;
  selectedPhotoName = this.i18nService.translate('pages.users.noFileSelected');
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
        this.errorMessage = this.i18nService.translate('pages.users.formLoadError');
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
    this.selectedPhotoName = file.name;
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
        this.successMessage = this.i18nService.translate(
          this.isEditMode ? 'pages.users.updateSuccess' : 'pages.users.createSuccess'
        );
        this.router.navigate(['/users', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.i18nService.translate('pages.users.formSaveError');
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
