import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GameDto, GameService } from '../../core/game.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card">
        <div class="actions" style="justify-content: space-between; align-items: center;">
          <div>
            <h1>Listado de juegos</h1>
            <p class="muted">Consulta, navega y gestiona tu colección de videojuegos.</p>
          </div>
          <a class="btn btn-primary" routerLink="/games/new">Dar de alta juego</a>
        </div>

        <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

        <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
          <table class="table" *ngIf="games.length; else emptyTpl">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Plataforma</th>
                <th style="width: 240px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let game of games">
                <td>{{ game.name }}</td>
                <td>{{ game.description }}</td>
                <td>{{ game.platform_name }}</td>
                <td>
                  <div class="actions">
                    <a class="btn btn-secondary" [routerLink]="['/games', game.id]">Detalle</a>
                    <a class="btn btn-primary" [routerLink]="['/games', game.id, 'edit']">Editar</a>
                    <button class="btn btn-danger" type="button" (click)="remove(game)">Borrar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #loadingTpl>
          <p>Cargando juegos...</p>
        </ng-template>

        <ng-template #emptyTpl>
          <p>No hay juegos registrados.</p>
        </ng-template>
      </div>
    </div>
  `
})
export class GamesListComponent implements OnInit {
  private readonly gameService = inject(GameService);

  games: GameDto[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.errorMessage = '';

    this.gameService.getAll().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el listado de juegos.';
        this.loading = false;
      }
    });
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
        this.games = this.games.filter((g) => g.id !== game.id);
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el juego.';
      }
    });
  }
}