import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameDto } from '../../../core/game.service';
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

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/inventory/studios">{{ 'common.back' | translate }}</a>
          <a class="btn btn-primary" [routerLink]="['/inventory/studios', studio.id, 'edit']">{{ 'common.edit' | translate }}</a>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;" *ngIf="studio">
        <h2>{{ 'pages.games.relatedTitle' | translate }}</h2>

        <div *ngIf="gamesErrorMessage" class="status-error" style="margin: 16px 0;">{{ gamesErrorMessage }}</div>
        <div *ngIf="gamesLoading" class="muted">{{ 'pages.games.relatedLoading' | translate }}</div>
        <div *ngIf="!gamesLoading && !games.length" class="muted">{{ 'pages.games.relatedEmpty' | translate }}</div>

        <div class="table-wrapper" *ngIf="!gamesLoading && games.length">
          <table class="table">
            <thead>
              <tr>
                <th>{{ 'common.image' | translate }}</th>
                <th>{{ 'common.name' | translate }}</th>
                <th>{{ 'common.description' | translate }}</th>
                <th>{{ 'pages.games.platforms' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let game of games" (click)="openGame(game.id!)" class="clickable-row">
                <td>
                  <img
                    [src]="game.image_url || defaultImage"
                    (error)="onImageError($event)"
                    [alt]="game.name"
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                  />
                </td>
                <td>{{ game.name }}</td>
                <td>{{ game.description }}</td>
                <td><span class="pill">{{ displayPlatform(game) }}</span></td>
              </tr>
            </tbody>
          </table>

          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="gamesTotalPages > 0">
            <div class="muted">
              {{ 'common.pageInfo' | translate: { page: gamesCurrentPage + 1, totalPages: gamesTotalPages, totalElements: gamesTotalElements, items: ('pages.games.items' | translate) } }}
            </div>
            <div class="actions">
              <button class="btn btn-secondary" type="button" (click)="goToPreviousGamesPage()" [disabled]="gamesCurrentPage === 0">{{ 'common.previous' | translate }}</button>
              <button class="btn btn-secondary" type="button" (click)="goToNextGamesPage()" [disabled]="gamesCurrentPage >= gamesTotalPages - 1">{{ 'common.next' | translate }}</button>
            </div>
          </div>
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
  private readonly router = inject(Router);
  private readonly studioService = inject(StudioService);
  private readonly i18nService = inject(I18nService);

  studio?: StudioDto;
  games: GameDto[] = [];
  loading = true;
  gamesLoading = false;
  errorMessage = '';
  gamesErrorMessage = '';
  gamesCurrentPage = 0;
  gamesPageSize = 5;
  gamesTotalPages = 0;
  gamesTotalElements = 0;
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

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
        this.loadGames();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.studios.detailLoadError');
        this.loading = false;
      }
    });
  }

  loadGames(): void {
    if (!this.studio?.id) {
      return;
    }

    this.gamesLoading = true;
    this.gamesErrorMessage = '';

    this.studioService.getGames(this.studio.id, undefined, 'name', 'asc', this.gamesCurrentPage, this.gamesPageSize).subscribe({
      next: (response) => {
        this.games = response.content;
        this.gamesCurrentPage = response.page;
        this.gamesPageSize = response.size;
        this.gamesTotalPages = response.total_pages;
        this.gamesTotalElements = response.total_elements;
        this.gamesLoading = false;
      },
      error: () => {
        this.gamesErrorMessage = this.i18nService.translate('pages.games.relatedLoadError');
        this.gamesLoading = false;
      }
    });
  }

  goToPreviousGamesPage(): void {
    if (this.gamesCurrentPage > 0) {
      this.gamesCurrentPage--;
      this.loadGames();
    }
  }

  goToNextGamesPage(): void {
    if (this.gamesCurrentPage < this.gamesTotalPages - 1) {
      this.gamesCurrentPage++;
      this.loadGames();
    }
  }

  openGame(id: string): void {
    this.router.navigate(['inventory', 'games', id]);
  }

  displayPlatform(game: GameDto): string {
    if (game.platform_name) {
      return game.platform_name;
    }

    if (game.platform_names?.length === 1) {
      return game.platform_names[0];
    }

    if (game.platform_names && game.platform_names.length > 1) {
      return this.i18nService.translate('pages.games.multiplatform');
    }

    return game.platform_id ?? '-';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
