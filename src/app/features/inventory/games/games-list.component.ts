import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GameDto, GameService } from '../../../core/game.service';
import { I18nService } from '../../../core/i18n.service';
import { TranslatePipe } from '../../../core/translate.pipe';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent, TranslatePipe],
  template: `
    <div>
      <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
          <h1>{{ 'pages.games.title' | translate }}</h1>
          <p class="muted">{{ 'pages.games.subtitle' | translate }}</p>
        </div>
        <a class="btn btn-primary" routerLink="/inventory/games/new">{{ 'pages.games.new' | translate }}</a>
      </div>

      <div class="form-field" style="margin: 16px 0;">
        <label for="search">{{ 'pages.games.search' | translate }}</label>
        <input
          id="search"
          type="text"
          [(ngModel)]="searchTerm"
          (input)="applyFilter()"
          [placeholder]="'pages.games.searchPlaceholder' | translate"
        />
      </div>

      <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

      <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
        <table class="table" *ngIf="filteredGames.length; else emptyTpl">
          <thead>
            <tr>
              <th>{{ 'common.image' | translate }}</th>
              <th (click)="sort('name')" class="sortable-header">
                <span>{{ 'common.name' | translate }}</span>
                <span class="sort-icon">{{ getSortIcon('name') }}</span>
              </th>
              <th (click)="sort('description')" class="sortable-header">
                <span>{{ 'common.description' | translate }}</span>
                <span class="sort-icon">{{ getSortIcon('description') }}</span>
              </th>
              <th (click)="sort('platform')" class="sortable-header">
                <span>{{ 'pages.games.platform' | translate }}</span>
                <span class="sort-icon">{{ getSortIcon('platform') }}</span>
              </th>
              <th>{{ 'pages.games.studio' | translate }}</th>
              <th style="width: 240px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let game of filteredGames" (click)="openGame(game.id!)" class="clickable-row">
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
              <td>{{ game.studio_name || '-' }}</td>
              <td class="actions-cell" (click)="$event.stopPropagation()">
                <div class="row-actions">
                  <button class="btn btn-secondary" type="button" (click)="edit($event, game.id!)">
                    {{ 'common.edit' | translate }}
                  </button>
                  <button class="btn btn-danger" type="button" (click)="deleteGame($event, game.id!, game.name)">
                    {{ 'common.delete' | translate }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="!loading && totalPages > 0">
          <div class="muted">
            {{ 'common.pageInfo' | translate: { page: currentPage + 1, totalPages: totalPages, totalElements: totalElements, items: ('pages.games.items' | translate) } }}
          </div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 0">
              {{ 'common.previous' | translate }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="goToNextPage()" [disabled]="currentPage >= totalPages - 1">
              {{ 'common.next' | translate }}
            </button>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl>
        <p>{{ 'pages.games.loading' | translate }}</p>
      </ng-template>

      <ng-template #emptyTpl>
        <p>{{ 'pages.games.empty' | translate }}</p>
      </ng-template>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      [title]="'confirm.deleteGameTitle' | translate"
      [message]="'confirm.deleteGameMessage' | translate: { name: gameNameToDelete }"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class GamesListComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);

  games: GameDto[] = [];
  filteredGames: GameDto[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  sortField = 'name';
  sortDir = 'asc';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';
  confirmDeleteOpen = false;
  gameIdToDelete: string | null = null;
  gameNameToDelete = '';

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.errorMessage = '';

    this.gameService.getAll(this.searchTerm, this.sortField, this.sortDir, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.games = response.content;
        this.filteredGames = response.content;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalPages = response.total_pages;
        this.totalElements = response.total_elements;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.games.loadError');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadGames();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.currentPage = 0;
    this.loadGames();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGames();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGames();
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  edit(event: Event, id: string): void {
    event.stopPropagation();
    this.router.navigate(['inventory', 'games', id, 'edit']);
  }

  deleteGame(event: Event, id: string, name: string): void {
    event.stopPropagation();
    this.gameIdToDelete = id;
    this.gameNameToDelete = name;
    this.confirmDeleteOpen = true;
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }

    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  openGame(id: string): void {
    this.router.navigate(['inventory', 'games', id]);
  }

  cancelDelete(): void {
    this.confirmDeleteOpen = false;
    this.gameIdToDelete = null;
    this.gameNameToDelete = '';
  }

  confirmDelete(): void {
    if (!this.gameIdToDelete) {
      return;
    }

    this.gameService.delete(this.gameIdToDelete).subscribe({
      next: () => {
        this.successMessage = this.i18nService.translate('pages.games.deleteSuccess');
        this.cancelDelete();
        this.loadGames();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.games.deleteError');
        this.cancelDelete();
      }
    });
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
}
