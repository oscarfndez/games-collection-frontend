import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../../core/i18n.service';
import { PlatformDto, PlatformService } from '../../../core/platform.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ (isEditMode ? 'pages.platforms.editTitle' : 'pages.platforms.createTitle') | translate }}</h1>
        <p class="muted">
          {{ (isEditMode ? 'pages.platforms.editSubtitle' : 'pages.platforms.createSubtitle') | translate }}
        </p>

        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="name">{{ 'common.name' | translate }}</label>
            <input id="name" type="text" formControlName="name" />
          </div>

          <div class="form-field">
            <label for="description">{{ 'common.description' | translate }}</label>
            <textarea id="description" formControlName="description"></textarea>
          </div>

          <div class="form-field">
            <label for="imageUrl">{{ 'pages.platforms.imageUrl' | translate }}</label>
            <input id="imageUrl" type="text" formControlName="image_url" placeholder="https://..." />
          </div>

          <div class="form-field">
            <label>{{ 'pages.platforms.preview' | translate }}</label>
            <div style="margin-top: 8px;">
              <img
                [src]="form.controls.image_url.value || defaultImage"
                (error)="onImageError($event)"
                [alt]="'pages.platforms.imagePreviewAlt' | translate"
                style="max-width: 260px; width: 100%; border-radius: 12px; border: 1px solid #d0d7e2;"
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
  `
})
export class PlatformFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformService = inject(PlatformService);
  private readonly i18nService = inject(I18nService);

  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';
  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  private platformId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    image_url: ['']
  });

  ngOnInit(): void {
    this.platformId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.platformId;

    if (this.platformId) {
      this.loadPlatform(this.platformId);
    }
  }

  loadPlatform(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.platformService.getById(id).subscribe({
      next: (platform: PlatformDto) => {
        this.form.patchValue({
          name: platform.name,
          description: platform.description,
          image_url: platform.image_url ?? ''
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.platforms.formLoadError');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: PlatformDto = this.form.getRawValue();
    const request$ = this.isEditMode && this.platformId
      ? this.platformService.update(this.platformId, payload)
      : this.platformService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = this.i18nService.translate(
          this.isEditMode ? 'pages.platforms.updateSuccess' : 'pages.platforms.createSuccess'
        );
        this.router.navigate(['/inventory', 'platforms', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.i18nService.translate('pages.platforms.formSaveError');
      }
    });
  }

  goBack(): void {
    if (this.platformId) {
      this.router.navigate(['/inventory', 'platforms', this.platformId]);
      return;
    }

    this.router.navigate(['/inventory', 'platforms']);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
