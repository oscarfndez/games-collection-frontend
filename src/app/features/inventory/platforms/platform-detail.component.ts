import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n.service';
import { PlatformDto, PlatformService } from '../../../core/platform.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="platform; else stateTpl">
        <h1>{{ platform.name }}</h1>

        <div style="margin-top: 8px;">
          <img
            [src]="platform.image_url || defaultImage"
            (error)="onImageError($event)"
            [alt]="'pages.platforms.imagePreviewAlt' | translate"
            style="max-width: 260px; width: 100%; border-radius: 12px; border: 1px solid #d0d7e2;"
          />
        </div>

        <p><strong>ID:</strong> {{ platform.id }}</p>
        <p><strong>{{ 'common.description' | translate }}:</strong> {{ platform.description }}</p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/inventory/platforms">{{ 'common.back' | translate }}</a>
          <a class="btn btn-primary" [routerLink]="['/inventory', '/platforms', platform.id, 'edit']">{{ 'common.edit' | translate }}</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">{{ 'pages.platforms.detailLoading' | translate }}</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class PlatformDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformService = inject(PlatformService);
  private readonly i18nService = inject(I18nService);

  platform?: PlatformDto;
  loading = true;
  errorMessage = '';
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = this.i18nService.translate('pages.platforms.detailMissingId');
      return;
    }

    this.platformService.getById(id).subscribe({
      next: (platform) => {
        this.platform = platform;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.platforms.detailLoadError');
        this.loading = false;
      }
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
