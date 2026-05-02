import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudioDto, StudioService } from '../../../core/studio.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="studio; else stateTpl">
        <h1>{{ studio.name }}</h1>
        <p><strong>ID:</strong> {{ studio.id }}</p>
        <p><strong>Descripcion:</strong> {{ studio.description }}</p>
        <p><strong>Ubicacion:</strong> {{ studio.location }}</p>
        <p><strong>First party:</strong> {{ studio.first_party ? 'Si' : 'No' }}</p>
        <p><strong>Juegos asociados:</strong> {{ studio.games_count ?? 0 }}</p>
        <p *ngIf="studio.game_names?.length">
          <strong>Juegos:</strong> {{ studio.game_names?.join(', ') }}
        </p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/inventory/studios">Volver</a>
          <a class="btn btn-primary" [routerLink]="['/inventory/studios', studio.id, 'edit']">Editar</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">Cargando detalle del estudio...</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class StudioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly studioService = inject(StudioService);

  studio?: StudioDto;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = 'No se ha indicado el identificador del estudio.';
      return;
    }

    this.studioService.getById(id).subscribe({
      next: (studio) => {
        this.studio = studio;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle del estudio.';
        this.loading = false;
      }
    });
  }
}
