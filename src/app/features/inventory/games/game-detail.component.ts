import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GameDto, GameService } from '../../../core/game.service';
import { I18nService } from '../../../core/i18n.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="game; else stateTpl">
        <h1>{{ game.name }}</h1>
        <p class="muted">{{ 'pages.games.detailsSubtitle' | translate }}</p>

        <div style="margin: 16px 0;">
          <img
            [src]="game.image_url || defaultImage"
            (error)="onImageError($event)"
            [alt]="game.name"
            style="max-width: 320px; width: 100%; border-radius: 12px;"
          />
        </div>

        <p><strong>ID:</strong> {{ game.id }}</p>
        <p><strong>{{ 'common.description' | translate }}:</strong> {{ game.description }}</p>
        <p><strong>{{ 'pages.games.studio' | translate }}:</strong> {{ game.studio_name || ('pages.games.unknownStudio' | translate) }}</p>
        <p><strong>{{ 'pages.games.platform' | translate }}:</strong> {{ game.platform_name || '-' }}</p>
        <p *ngIf="game.platform_names?.length">
          <strong>{{ 'pages.games.availableOn' | translate }}:</strong> {{ game.platform_names?.join(', ') }}
        </p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/inventory/games">{{ 'common.back' | translate }}</a>
          <a class="btn btn-primary" [routerLink]="['/inventory/games', game.id, 'edit']">{{ 'common.edit' | translate }}</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">{{ 'pages.games.detailLoading' | translate }}</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class GameDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly i18nService = inject(I18nService);

  game?: GameDto;
  loading = true;
  errorMessage = '';
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = this.i18nService.translate('pages.games.detailMissingId');
      return;
    }

    this.gameService.getById(id).subscribe({
      next: (game) => {
        this.game = game;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.games.detailLoadError');
        this.loading = false;
      }
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
