import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlatformDto, PlatformService } from '../../core/platform.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

        <div class="form-field" style="margin: 16px 0;">
          <label for="search">Buscar plataforma</label>
          <input
            id="search"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            placeholder="Busca por nombre o descripción"
          />
        </div>

        <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

        <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
          <table class="table" *ngIf="filteredPlatforms.length; else emptyTpl">
            <thead>
              <tr>
                <th (click)="sort('name')" class="sortable-header">
                  <span>Nombre</span>
                  <span class="sort-icon">{{ getSortIcon('name') }}</span>
                </th>
                <th (click)="sort('description')" class="sortable-header">
                  <span>Descripción</span>
                  <span class="sort-icon">{{ getSortIcon('description') }}</span>
                </th>
                <th style="width: 240px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let platform of filteredPlatforms" (click)="openPlatform(platform.id!)" class="clickable-row">                <td>{{ platform.name }}</td>
                <td>{{ platform.description }}</td>
                <td>
                  <div class="actions">
                    <button class="action-btn" type="button" (click)="edit(platform.id!)">Editar</button>
                    <button class="action-btn danger" type="button" (click)="deletePlatform(platform.id!)">Borrar</button>
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
  private readonly router = inject(Router);

  platforms: PlatformDto[] = [];
  filteredPlatforms: PlatformDto[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  sortField = 'name';
  sortDir = 'asc';

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    this.loading = true;
    this.errorMessage = '';

    this.platformService.getAll(this.searchTerm, this.sortField, this.sortDir).subscribe({
      next: (platforms) => {
        this.platforms = platforms;
        this.filteredPlatforms = platforms;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el listado de plataformas.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.loadPlatforms();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.loadPlatforms();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }

    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  view(id: string): void {
    this.router.navigate(['/platforms', id]);
  }

edit(event: Event, id: string): void {
  event.stopPropagation();
  this.router.navigate(['/platforms', id, 'edit']);
}

deletePlatform(event: Event, id: string): void {
  event.stopPropagation();

  const confirmed = window.confirm('¿Seguro que quieres borrar esta plataforma?');
  if (!confirmed) {
    return;
  }

  this.platformService.delete(id).subscribe({
    next: () => {
      this.successMessage = 'Plataforma eliminada correctamente.';
      this.loadPlatforms();
    },
    error: () => {
      this.errorMessage = 'No se pudo eliminar la plataforma.';
    }
  });
}

openPlatform(id: string): void {
  this.router.navigate(['/platforms', id]);
}
}