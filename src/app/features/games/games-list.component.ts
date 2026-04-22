import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameDto, GameService } from '../../core/game.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  standalone: true,
     imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],  template: `
      <div>
        <div class="actions" style="justify-content: space-between; align-items: center;">
          <div>
            <h1>Listado de juegos</h1>
            <p class="muted">Consulta, navega y gestiona tu colección de videojuegos.</p>
          </div>
          <a class="btn btn-primary" routerLink="/games/new">+</a>
        </div>

        <div class="form-field" style="margin: 16px 0;">
          <label for="search">Buscar juego</label>
          <input
            id="search"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            placeholder="Busca por nombre, descripción o plataforma"
          />
        </div>

        <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

        <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
          <table class="table" *ngIf="filteredGames.length; else emptyTpl">
            <thead>
              <tr>
                <th>Imagen</th>
                <th (click)="sort('name')" class="sortable-header">
                  <span>Nombre</span>
                  <span class="sort-icon">{{ getSortIcon('name') }}</span>
                </th>

                <th (click)="sort('description')" class="sortable-header">
                  <span>Descripción</span>
                  <span class="sort-icon">{{ getSortIcon('description') }}</span>
                </th>

                <th (click)="sort('platform')" class="sortable-header">
                  <span>Plataforma</span>
                  <span class="sort-icon">{{ getSortIcon('platform') }}</span>
                </th>
                <th style="width: 240px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let game of filteredGames" (click)="openGame(game.id!)" class="clickable-row">              <td>
                <img
                  [src]="game.image_url || defaultImage"
                  (error)="onImageError($event)"
                 [alt]="game.name"
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                 />
              </td>
                <td>{{ game.name }}</td>
                <td>{{ game.description }}</td>
                <td>{{ game.platform_name || game.platform_id }}</td>
                <td>
                  <div class="actions">
                    <button class="action-btn" (click)="edit($event, game.id!)">Editar</button>
                    <button class="action-btn danger" (click)="deleteGame($event, game.id!, game.name)">Borrar</button>                  </div>
                 </td>
              </tr>
            </tbody>
          </table>
          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="!loading && totalPages > 0">
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

        <ng-template #loadingTpl>
          <p>Cargando juegos...</p>
        </ng-template>

        <ng-template #emptyTpl>
          <p>No hay juegos registrados.</p>
        </ng-template>
    </div>
    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      title="Eliminar juego"
      [message]="'¿Seguro que quieres eliminar el juego &quot;' + gameNameToDelete + '&quot;?'"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `

})

export class GamesListComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

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
  defaultImage = 'https://play-lh.googleusercontent.com/0goocG7RJZDZ41ShfBPl-h7ctwHKHjqzn4nSImyL8_RWyXqeYNKw-CdGAKhgPGZG5Es=w480-h960-rw';
  confirmDeleteOpen = false;
  gameIdToDelete: string | null = null;
  gameNameToDelete = '';

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.errorMessage = '';

    this.gameService.getAll(
      this.searchTerm,
      this.sortField,
      this.sortDir,
      this.currentPage,
      this.pageSize
    ).subscribe({
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
        this.errorMessage = 'No se pudo cargar el listado de juegos.';
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

  remove(game: GameDto): void {
    if (!game.id) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${game.name}"?`);
    if (!confirmed) {
      return;
    }

    this.gameService.delete(game.id).subscribe({
      next: () => {
        this.successMessage = 'Juego eliminado correctamente.';
        this.loadGames();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el juego.';
      }
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

view(id: string): void {
  this.router.navigate(['/games', id]);
}

edit(event: Event, id: string): void {
  event.stopPropagation();
  this.router.navigate(['/games', id, 'edit']);
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
  this.router.navigate(['/games', id]);
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
      this.successMessage = 'Juego eliminado correctamente.';
      this.cancelDelete();
      this.loadGames();
    },
    error: () => {
      this.errorMessage = 'No se pudo eliminar el juego.';
      this.cancelDelete();
    }
  });
}

}