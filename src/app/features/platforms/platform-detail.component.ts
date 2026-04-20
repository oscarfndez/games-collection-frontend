import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlatformDto, PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="platform; else stateTpl">
        <h1>{{ platform.name }}</h1>
        <p><strong>ID:</strong> {{ platform.id }}</p>
        <p><strong>Descripción:</strong> {{ platform.description }}</p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/platforms">Volver</a>
          <a class="btn btn-primary" [routerLink]="['/platforms', platform.id, 'edit']">Editar</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">Cargando detalle de la plataforma...</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class PlatformDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformService = inject(PlatformService);

  platform?: PlatformDto;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = 'No se ha indicado el identificador de la plataforma.';
      return;
    }

    this.platformService.getById(id).subscribe({
      next: (platform) => {
        this.platform = platform;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle de la plataforma.';
        this.loading = false;
      }
    });
  }
}