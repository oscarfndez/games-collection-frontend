import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GameDto, GameService } from '../../core/game.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="game; else stateTpl">
        <h1>{{ game.name }}</h1>
        <p><strong>ID:</strong> {{ game.id }}</p>
        <p><strong>Descripción:</strong> {{ game.description }}</p>
        <p><strong>Plataforma:</strong> {{ game.platform_name }}</p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/games">Volver</a>
          <a class="btn btn-primary" [routerLink]="['/games', game.id, 'edit']">Editar</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">Cargando detalle del juego...</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class GameDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);

  game?: GameDto;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = 'No se ha indicado el identificador del juego.';
      return;
    }

    this.gameService.getById(id).subscribe({
      next: (game) => {
        this.game = game;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle del juego.';
        this.loading = false;
      }
    });
  }
}