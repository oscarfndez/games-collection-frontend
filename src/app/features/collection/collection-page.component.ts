import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService, GameItemDto } from '../../core/collection.service';
import { GameDto, GameService } from '../../core/game.service';
import { UserService, WhoAmI } from '../../core/user.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <h2>Añadir juego</h2>
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
              Añadir a colección
            </button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <h2>Juegos en colección</h2>

        <div *ngIf="loading">Cargando colección...</div>
        <div *ngIf="!loading && !items.length" class="muted">No hay juegos en esta colección.</div>

        <div class="table-wrapper" *ngIf="!loading && items.length">
          <table class="table">
            <thead>
              <tr>
                <th>Juego</th>
                <th>Plataforma</th>
                <th style="width: 120px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items">
                <td>{{ item.game_name }}</td>
                <td>{{ item.platform_name }}</td>
                <td>
                  <button class="btn btn-danger" type="button" (click)="remove(item)">Quitar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
    this.collectionService.getMine().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la colección.';
        this.loading = false;
      }
    });
  }

  addToCollection(): void {
    if (!this.canAdd) {
      return;
    }

    this.collectionService.add({
      game_id: this.selectedGameId,
      platform_id: this.selectedPlatformId
    }).subscribe({
      next: () => {
        this.successMessage = 'Juego añadido a la colección.';
        this.selectedGameId = '';
        this.selectedPlatformId = '';
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = 'No se pudo añadir el juego a la colección.';
      }
    });
  }

  remove(item: GameItemDto): void {
    if (!item.id) {
      return;
    }

    this.collectionService.delete(item.id).subscribe({
      next: () => {
        this.successMessage = 'Juego eliminado de la colección.';
        this.loadCollection();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el juego de la colección.';
      }
    });
  }

  platformName(game: GameDto, platformId: string): string {
    const platformIndex = game.platform_ids?.indexOf(platformId) ?? -1;
    return platformIndex >= 0
      ? game.platform_names?.[platformIndex] ?? platformId
      : platformId;
  }
}
