import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../../core/i18n.service';
import { StudioDto, StudioService } from '../../../core/studio.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ (isEditMode ? 'pages.studios.editTitle' : 'pages.studios.createTitle') | translate }}</h1>
        <p class="muted">{{ (isEditMode ? 'pages.studios.editSubtitle' : 'pages.studios.createSubtitle') | translate }}</p>

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
            <label for="location">{{ 'common.location' | translate }}</label>
            <input id="location" type="text" formControlName="location" />
          </div>

          <label class="checkbox-row">
            <input type="checkbox" formControlName="first_party" />
            <span>{{ 'pages.studios.firstParty' | translate }}</span>
          </label>

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
    .checkbox-row {
      align-items: center;
      display: inline-flex;
      gap: 10px;
      font-weight: 600;
    }
  `]
})
export class StudioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studioService = inject(StudioService);
  private readonly i18nService = inject(I18nService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  private studioId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    location: ['', [Validators.required]],
    first_party: [false]
  });

  ngOnInit(): void {
    this.studioId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.studioId;

    if (this.studioId) {
      this.loadStudio(this.studioId);
    }
  }

  loadStudio(id: string): void {
    this.loading = true;
    this.studioService.getById(id).subscribe({
      next: (studio) => {
        this.form.patchValue({
          name: studio.name,
          description: studio.description,
          location: studio.location,
          first_party: !!studio.first_party
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.studios.formLoadError');
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
    const payload: StudioDto = this.form.getRawValue();
    const request$ = this.isEditMode && this.studioId
      ? this.studioService.update(this.studioId, payload)
      : this.studioService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = this.i18nService.translate(
          this.isEditMode ? 'pages.studios.updateSuccess' : 'pages.studios.createSuccess'
        );
        this.router.navigate(['inventory', 'studios', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.i18nService.translate('pages.studios.formSaveError');
      }
    });
  }

  goBack(): void {
    if (this.studioId) {
      this.router.navigate(['inventory', 'studios', this.studioId]);
      return;
    }
    this.router.navigate(['inventory', 'studios']);
  }
}
