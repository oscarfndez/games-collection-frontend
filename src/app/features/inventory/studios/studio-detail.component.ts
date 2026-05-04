import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n.service';
import { StudioDto, StudioService } from '../../../core/studio.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="studio; else stateTpl">
        <h1>{{ studio.name }}</h1>
        <p><strong>ID:</strong> {{ studio.id }}</p>
        <p><strong>{{ 'common.description' | translate }}:</strong> {{ studio.description }}</p>
        <p><strong>{{ 'common.location' | translate }}:</strong> {{ studio.location }}</p>
        <p><strong>{{ 'pages.studios.firstParty' | translate }}:</strong> {{ (studio.first_party ? 'common.yes' : 'common.no') | translate }}</p>
        <p><strong>{{ 'pages.studios.associatedGames' | translate }}:</strong> {{ studio.games_count ?? 0 }}</p>
        <p *ngIf="studio.game_names?.length">
          <strong>{{ 'pages.studios.games' | translate }}:</strong> {{ studio.game_names?.join(', ') }}
        </p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/inventory/studios">{{ 'common.back' | translate }}</a>
          <a class="btn btn-primary" [routerLink]="['/inventory/studios', studio.id, 'edit']">{{ 'common.edit' | translate }}</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">{{ 'pages.studios.detailLoading' | translate }}</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class StudioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly studioService = inject(StudioService);
  private readonly i18nService = inject(I18nService);

  studio?: StudioDto;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = this.i18nService.translate('pages.studios.detailMissingId');
      return;
    }

    this.studioService.getById(id).subscribe({
      next: (studio) => {
        this.studio = studio;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.studios.detailLoadError');
        this.loading = false;
      }
    });
  }
}
