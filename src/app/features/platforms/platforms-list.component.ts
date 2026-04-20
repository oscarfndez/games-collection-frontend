import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlatformDto, PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card">
        <div class="actions" style="justify-content: space-between; align-items: center;">
          <div>
            <h1>Listado de plataformas</h1>
            <p class="muted">Consulta, crea y gestiona las plataformas disponibles.</p>
          </div>
          <a class="btn btn-primary" routerLink="/platforms/new">Dar de alta plataforma</a>
        </div>

        <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

        <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
          <table class="table" *ngIf="platforms.length; else emptyTpl">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th style="width: 240px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let platform of platforms">
                <td>{{ platform.name }}</td>
                <td>{{ platform.description }}</td>
                <td>
                  <div class="actions">
                    <a class="btn btn-secondary" [routerLink]="['/platforms', platform.id]">Detalle</a>
                    <a class="btn btn-primary" [routerLink]="['/platforms', platform.id, 'edit']">Editar</a>
                    <button class="btn btn-danger" type="button" (click)="remove(platform)">Borrar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #loadingTpl>
          <p>Cargando plataformas...</p>
        </ng-template>

        <ng-template #emptyTpl>
          <p>No hay plataformas registradas.</p>
        </ng-template>
      </div>
    </div>
  `
})
export class PlatformsListComponent implements OnInit {
  private readonly platformService = inject(PlatformService);

  platforms: PlatformDto[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    this.loading = true;
    this.errorMessage = '';

    this.platformService.getAll().subscribe({
      next: (platforms) => {
        this.platforms = platforms;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el listado de plataformas.';
        this.loading = false;
      }
    });
  }

  remove(platform: PlatformDto): void {
    if (!platform.id) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${platform.name}"?`);
    if (!confirmed) {
      return;
    }

    this.platformService.delete(platform.id).subscribe({
      next: () => {
        this.successMessage = 'Plataforma eliminada correctamente.';
        this.platforms = this.platforms.filter((p) => p.id !== platform.id);
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar la plataforma.';
      }
    });
  }
}