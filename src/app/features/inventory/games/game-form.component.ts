import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameDto, GameService } from '../../../core/game.service';
import { I18nService } from '../../../core/i18n.service';
import { PlatformDto, PlatformService } from '../../../core/platform.service';
import { StudioDto, StudioService } from '../../../core/studio.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ (isEditMode ? 'pages.games.editTitle' : 'pages.games.createTitle') | translate }}</h1>
        <p class="muted">
          {{ (isEditMode ? 'pages.games.editSubtitle' : 'pages.games.createSubtitle') | translate }}
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
            <label>{{ 'pages.games.platforms' | translate }}</label>
            <p class="muted" style="margin: 0 0 8px;">{{ 'pages.games.selectPlatformsHelp' | translate }}</p>
            <div *ngIf="loadingPlatforms" class="muted">{{ 'pages.games.loadingPlatforms' | translate }}</div>
            <div *ngIf="!loadingPlatforms" class="platform-options">
              <div *ngFor="let platform of platforms" class="platform-option">
                <input
                  [id]="'platform-' + platform.id"
                  type="checkbox"
                  [checked]="isPlatformSelected(platform.id)"
                  (change)="togglePlatform(platform.id)"
                />
                <label [for]="'platform-' + platform.id">{{ platform.name }}</label>
              </div>
            </div>
            <div *ngIf="platformSelectionError" class="status-error" style="margin-top: 8px;">
              {{ 'pages.games.platformRequired' | translate }}
            </div>
          </div>

          <div class="form-field">
            <label for="studio">{{ 'pages.games.studio' | translate }}</label>
            <select id="studio" formControlName="studio_id">
              <option value="">{{ 'pages.games.unknownStudio' | translate }}</option>
              <option *ngFor="let studio of studios" [value]="studio.id">{{ studio.name }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="imageUrl">{{ 'pages.games.imageUrl' | translate }}</label>
            <input id="imageUrl" type="text" formControlName="image_url" placeholder="https://..." />
          </div>

          <div class="card" style="padding: 12px; margin-top: 8px;">
            <img
              [src]="form.controls.image_url.value || defaultImage"
              (error)="onImageError($event)"
              [alt]="'pages.games.imagePreviewAlt' | translate"
              style="max-width: 260px; width: 100%; border-radius: 12px;"
            />
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
    .platform-options {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .platform-options .platform-option {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      width: 100%;
      max-width: 100%;
    }

    .platform-options .platform-option input {
      flex: 0 0 auto;
      margin: 0;
      width: auto;
    }

    .platform-options .platform-option label {
      display: inline;
      margin: 0;
      width: auto;
      max-width: none;
      font-weight: 500;
      line-height: 1.25;
      cursor: pointer;
      text-align: left;
    }
  `]
})
export class GameFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly platformService = inject(PlatformService);
  private readonly studioService = inject(StudioService);
  private readonly i18nService = inject(I18nService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  private gameId: string | null = null;
  platforms: PlatformDto[] = [];
  studios: StudioDto[] = [];
  loadingPlatforms = false;
  loadingStudios = false;
  platformSelectionError = false;
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    platform_ids: [[] as string[]],
    studio_id: [''],
    image_url: ['']
  });

  ngOnInit(): void {
    this.loadPlatforms();
    this.loadStudios();

    this.gameId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.gameId;

    if (this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  loadPlatforms(): void {
    this.loadingPlatforms = true;

    this.platformService.getAll(undefined, 'name', 'asc', 0, 1000).subscribe({
      next: (response) => {
        this.platforms = response.content;
        this.loadingPlatforms = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.games.loadingPlatforms');
        this.loadingPlatforms = false;
      }
    });
  }

  loadStudios(): void {
    this.loadingStudios = true;

    this.studioService.getAll(undefined, 'name', 'asc', 0, 1000).subscribe({
      next: (response) => {
        this.studios = response.content;
        this.loadingStudios = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.games.loadingStudios');
        this.loadingStudios = false;
      }
    });
  }

  loadGame(id: string): void {
    this.loading = true;

    this.gameService.getById(id).subscribe({
      next: (game: GameDto) => {
        this.form.patchValue({
          name: game.name,
          description: game.description,
          platform_ids: game.platform_ids?.length ? game.platform_ids : game.platform_id ? [game.platform_id] : [],
          image_url: game.image_url ?? '',
          studio_id: game.studio_id ?? ''
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.games.formLoadError');
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.platform_ids.value.length === 0) {
      this.platformSelectionError = true;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.platformSelectionError = false;

    const payload = this.form.getRawValue();
    const normalizedPayload = {
      ...payload,
      studio_id: payload.studio_id || undefined
    };

    const request$ = this.isEditMode && this.gameId
      ? this.gameService.update(this.gameId, normalizedPayload)
      : this.gameService.create(normalizedPayload);

    request$.subscribe({
      next: (saved) => {
        this.loading = false;
        this.successMessage = this.i18nService.translate(
          this.isEditMode ? 'pages.games.updateSuccess' : 'pages.games.createSuccess'
        );
        this.router.navigate(['inventory', 'games', saved.id]);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.i18nService.translate('pages.games.formSaveError');
      }
    });
  }

  goBack(): void {
    if (this.gameId) {
      this.router.navigate(['inventory', 'games', this.gameId]);
      return;
    }

    this.router.navigate(['inventory', 'games']);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  isPlatformSelected(platformId?: string): boolean {
    return !!platformId && this.form.controls.platform_ids.value.includes(platformId);
  }

  togglePlatform(platformId?: string): void {
    if (!platformId) {
      return;
    }

    const selectedPlatformIds = this.form.controls.platform_ids.value;
    const nextPlatformIds = selectedPlatformIds.includes(platformId)
      ? selectedPlatformIds.filter((id) => id !== platformId)
      : [...selectedPlatformIds, platformId];

    this.form.controls.platform_ids.setValue(nextPlatformIds);
    this.platformSelectionError = nextPlatformIds.length === 0;
  }
}
