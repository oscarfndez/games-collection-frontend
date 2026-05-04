import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollectionService, GameItemDto } from '../../core/collection.service';
import { GameDto, GameService } from '../../core/game.service';
import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { UserService, WhoAmI } from '../../core/user.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>{{ 'pages.collection.title' | translate }}</h1>
        <p class="muted">{{ 'pages.collection.subtitle' | translate }}</p>

        <p class="muted" *ngIf="currentUser">
          {{ 'pages.collection.currentUser' | translate: { email: currentUser.email } }}
        </p>

        <div *ngIf="errorMessage" class="status-error" style="margin-top: 16px;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin-top: 16px;">{{ successMessage }}</div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>{{ (editingItemId ? 'pages.collection.editTitle' : 'pages.collection.addTitle') | translate }}</h2>
        <div class="form-grid">
          <div class="form-field">
            <label for="game">{{ 'pages.collection.game' | translate }}</label>
            <select id="game" [(ngModel)]="selectedGameId" (change)="selectedPlatformId = ''">
              <option value="">{{ 'pages.collection.selectGame' | translate }}</option>
              <option *ngFor="let game of games" [value]="game.id">{{ game.name }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="platform">{{ 'pages.games.platform' | translate }}</label>
            <select id="platform" [(ngModel)]="selectedPlatformId" [disabled]="!selectedGame">
              <option value="">{{ 'pages.collection.selectPlatform' | translate }}</option>
              <option *ngFor="let platformId of selectedGame?.platform_ids ?? []" [value]="platformId">
                {{ platformName(selectedGame!, platformId) }}
              </option>
            </select>
          </div>

          <div class="actions">
            <button class="btn btn-primary" type="button" (click)="addToCollection()" [disabled]="!canAdd">
              {{ (editingItemId ? 'pages.collection.saveChanges' : 'pages.collection.addToCollection') | translate }}
            </button>
            <button class="btn btn-secondary" type="button" *ngIf="editingItemId" (click)="cancelEdit()">
              {{ 'common.cancelEdit' | translate }}
            </button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>{{ 'pages.collection.listTitle' | translate }}</h2>

        <div class="form-field" style="margin: 16px 0;">
          <label for="collectionSearch">{{ 'pages.collection.search' | translate }}</label>
          <input
            id="collectionSearch"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            [placeholder]="'pages.collection.searchPlaceholder' | translate"
          />
        </div>

        <div *ngIf="loading">{{ 'pages.collection.loading' | translate }}</div>
        <div *ngIf="!loading && !items.length" class="muted">{{ 'pages.collection.empty' | translate }}</div>

        <div class="table-wrapper" *ngIf="!loading && items.length">
          <table class="table">
            <thead>
              <tr>
                <th>{{ 'common.image' | translate }}</th>
                <th (click)="sort('game')" class="sortable-header">
                  <span>{{ 'pages.collection.game' | translate }}</span>
                  <span class="sort-icon">{{ getSortIcon('game') }}</span>
                </th>
                <th (click)="sort('platform')" class="sortable-header">
                  <span>{{ 'pages.games.platform' | translate }}</span>
                  <span class="sort-icon">{{ getSortIcon('platform') }}</span>
                </th>
                <th style="width: 220px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items">
                <td>
                  <img
                    [src]="item.game_image_url || defaultImage"
                    (error)="onImageError($event)"
                    [alt]="item.game_name"
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                  />
                </td>
                <td>{{ item.game_name }}</td>
                <td><span class="pill">{{ item.platform_name }}</span></td>
                <td>
                  <div class="row-actions">
                    <button class="btn btn-secondary" type="button" (click)="edit(item)">{{ 'common.edit' | translate }}</button>
                    <button class="btn btn-danger" type="button" (click)="remove(item)">{{ 'common.delete' | translate }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="totalPages > 0">
            <div class="muted">
              {{ 'common.pageInfo' | translate: { page: currentPage + 1, totalPages: totalPages, totalElements: totalElements, items: ('pages.collection.items' | translate) } }}
            </div>
            <div class="actions">
              <button class="btn btn-secondary" type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 0">{{ 'common.previous' | translate }}</button>
              <button class="btn btn-secondary" type="button" (click)="goToNextPage()" [disabled]="currentPage >= totalPages - 1">{{ 'common.next' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      [title]="'confirm.removeCollectionTitle' | translate"
      [message]="'confirm.removeCollectionMessage' | translate: { name: gameNameToDelete }"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class CollectionPageComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);
  private readonly i18nService = inject(I18nService);

  currentUser?: WhoAmI;
  items: GameItemDto[] = [];
  games: GameDto[] = [];
  selectedGameId = '';
  selectedPlatformId = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  sortField = 'game';
  sortDir = 'asc';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';
  confirmDeleteOpen = false;
  itemIdToDelete: string | null = null;
  gameNameToDelete = '';
  editingItemId: string | null = null;

  ngOnInit(): void {
    this.loadGames();
    this.loadCurrentUserAndCollection();
  }

  get selectedGame(): GameDto | undefined {
    return this.games.find((game) => game.id === this.selectedGameId);
  }

  get canAdd(): boolean {
    return !!this.currentUser && !!this.selectedGameId && !!this.selectedPlatformId;
  }

  loadGames(): void {
    this.gameService.getAll(undefined, 'name', 'asc', 0, 1000).subscribe({
      next: (response) => {
        this.games = response.content;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.collection.availableGamesLoadError');
      }
    });
  }

  loadCurrentUserAndCollection(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.whoAmI().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.collection.currentUserError');
        this.loading = false;
      }
    });
  }

  loadCollection(): void {
    this.loading = true;
    this.errorMessage = '';
    this.collectionService.getMine(this.searchTerm, this.sortField, this.sortDir, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.items = response.content;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalPages = response.total_pages;
        this.totalElements = response.total_elements;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.collection.loadError');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadCollection();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.currentPage = 0;
    this.loadCollection();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCollection();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCollection();
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }

    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  addToCollection(): void {
    if (!this.canAdd) {
      return;
    }

    const payload = {
      game_id: this.selectedGameId,
      platform_id: this.selectedPlatformId
    };

    if (this.editingItemId) {
      this.collectionService.update(this.editingItemId, payload).subscribe({
        next: () => {
          this.successMessage = this.i18nService.translate('pages.collection.updateSuccess');
          this.cancelEdit();
          this.loadCollection();
        },
        error: () => {
          this.errorMessage = this.i18nService.translate('pages.collection.updateError');
        }
      });
      return;
    }

    this.collectionService.add(payload).subscribe({
      next: () => {
        this.successMessage = this.i18nService.translate('pages.collection.addSuccess');
        this.clearSelection();
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.collection.addError');
      }
    });
  }

  edit(item: GameItemDto): void {
    if (!item.id) {
      return;
    }

    this.editingItemId = item.id;
    this.selectedGameId = item.game_id;
    this.selectedPlatformId = item.platform_id;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editingItemId = null;
    this.clearSelection();
  }

  remove(item: GameItemDto): void {
    if (!item.id) {
      return;
    }

    this.itemIdToDelete = item.id;
    this.gameNameToDelete = item.game_name ?? this.i18nService.translate('pages.collection.fallbackGame');
    this.confirmDeleteOpen = true;
  }

  cancelDelete(): void {
    this.confirmDeleteOpen = false;
    this.itemIdToDelete = null;
    this.gameNameToDelete = '';
  }

  confirmDelete(): void {
    if (!this.itemIdToDelete) {
      return;
    }

    this.collectionService.delete(this.itemIdToDelete).subscribe({
      next: () => {
        this.successMessage = this.i18nService.translate('pages.collection.deleteSuccess');
        this.cancelDelete();
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.collection.deleteError');
        this.cancelDelete();
      }
    });
  }

  platformName(game: GameDto, platformId: string): string {
    const platformIndex = game.platform_ids?.indexOf(platformId) ?? -1;
    return platformIndex >= 0
      ? game.platform_names?.[platformIndex] ?? platformId
      : platformId;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  private clearSelection(): void {
    this.selectedGameId = '';
    this.selectedPlatformId = '';
  }
}
