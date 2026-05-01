import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService, GameItemDto } from '../../core/collection.service';
import { GameDto, GameService } from '../../core/game.service';
import { UserService, WhoAmI } from '../../core/user.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <div class="card">
        <h1>Mi colección</h1>
        <p class="muted">
          Gestiona los juegos que tienes en tu colección, indicando la plataforma concreta en la que los posees.
        </p>

        <p class="muted" *ngIf="currentUser">
          Usuario: {{ currentUser.email }}
        </p>

        <div *ngIf="errorMessage" class="status-error" style="margin-top: 16px;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin-top: 16px;">{{ successMessage }}</div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>{{ editingItemId ? 'Editar juego en colección' : 'Añadir juego' }}</h2>
        <div class="form-grid">
          <div class="form-field">
            <label for="game">Juego</label>
            <select id="game" [(ngModel)]="selectedGameId" (change)="selectedPlatformId = ''">
              <option value="">Selecciona un juego</option>
              <option *ngFor="let game of games" [value]="game.id">{{ game.name }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="platform">Plataforma</label>
            <select id="platform" [(ngModel)]="selectedPlatformId" [disabled]="!selectedGame">
              <option value="">Selecciona una plataforma</option>
              <option *ngFor="let platformId of selectedGame?.platform_ids ?? []" [value]="platformId">
                {{ platformName(selectedGame!, platformId) }}
              </option>
            </select>
          </div>

          <div class="actions">
            <button class="btn btn-primary" type="button" (click)="addToCollection()" [disabled]="!canAdd">
              {{ editingItemId ? 'Guardar cambios' : 'Añadir a colección' }}
            </button>
            <button class="btn btn-secondary" type="button" *ngIf="editingItemId" (click)="cancelEdit()">
              Cancelar edición
            </button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>Juegos en colección</h2>

        <div class="form-field" style="margin: 16px 0;">
          <label for="collectionSearch">Buscar en mi colección</label>
          <input
            id="collectionSearch"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            placeholder="Busca por nombre, descripción o plataforma"
          />
        </div>

        <div *ngIf="loading">Cargando colección...</div>
        <div *ngIf="!loading && !items.length" class="muted">No hay juegos en esta colección.</div>

        <div class="table-wrapper" *ngIf="!loading && items.length">
          <table class="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th (click)="sort('game')" class="sortable-header">
                  <span>Juego</span>
                  <span class="sort-icon">{{ getSortIcon('game') }}</span>
                </th>
                <th (click)="sort('platform')" class="sortable-header">
                  <span>Plataforma</span>
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
                <td>{{ item.platform_name }}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn btn-secondary" type="button" (click)="edit(item)">Editar</button>
                    <button class="btn btn-danger" type="button" (click)="remove(item)">Borrar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="totalPages > 0">
            <div class="muted">
              Página {{ currentPage + 1 }} de {{ totalPages }} · {{ totalElements }} juegos
            </div>

            <div class="actions">
              <button class="btn btn-secondary" type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 0">
                Anterior
              </button>
              <button class="btn btn-secondary" type="button" (click)="goToNextPage()" [disabled]="currentPage >= totalPages - 1">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      title="Quitar juego de la colección"
      [message]="'¿Seguro que quieres quitar &quot;' + gameNameToDelete + '&quot; de tu colección?'"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class CollectionPageComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);

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
        this.errorMessage = 'No se pudieron cargar los juegos disponibles.';
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
        this.errorMessage = 'No se pudo identificar el usuario actual.';
        this.loading = false;
      }
    });
  }

  loadCollection(): void {
    this.loading = true;
    this.errorMessage = '';
    this.collectionService.getMine(
      this.searchTerm,
      this.sortField,
      this.sortDir,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.items = response.content;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalPages = response.total_pages;
        this.totalElements = response.total_elements;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la colección.';
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
          this.successMessage = 'Juego actualizado en la colección.';
          this.cancelEdit();
          this.loadCollection();
        },
        error: () => {
          this.errorMessage = 'No se pudo actualizar el juego en la colección.';
        }
      });
      return;
    }

    this.collectionService.add(payload).subscribe({
      next: () => {
        this.successMessage = 'Juego añadido a la colección.';
        this.clearSelection();
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = 'No se pudo añadir el juego a la colección.';
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
    this.gameNameToDelete = item.game_name ?? 'este juego';
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
        this.successMessage = 'Juego eliminado de la colección.';
        this.cancelDelete();
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el juego de la colección.';
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
