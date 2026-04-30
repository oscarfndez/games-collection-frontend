import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlatformDto, PlatformService } from '../../../core/platform.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  template: `
      <div>
        <div class="actions" style="justify-content: space-between; align-items: center;">
          <div>
            <h1>Listado de plataformas</h1>
            <p class="muted">Consulta, crea y gestiona las plataformas disponibles.</p>
          </div>
          <a class="btn btn-primary" routerLink="/inventory/platforms/new">Nueva plataforma</a>
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
  <th>Imagen</th>
  <th (click)="sort('name')" class="sortable-header">
    <span>Nombre</span>
    <span class="sort-icon">{{ getSortIcon('name') }}</span>
  </th>
  <th (click)="sort('description')" class="sortable-header">
    <span>Descripción</span>
    <span class="sort-icon">{{ getSortIcon('description') }}</span>
  </th>
  <th style="width: 240px;"></th>
</tr>
           </thead>
            <tbody>
              <tr *ngFor="let platform of filteredPlatforms" (click)="openPlatform(platform.id!)" class="clickable-row">
              <td>
                <img
                  [src]="platform.image_url || defaultImage"
                  (error)="onImageError($event)"
                  [alt]="platform.name"
                  style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                />
              </td>
                <td>{{ platform.name }}</td>
                <td>{{ platform.description }}</td>
         <td class="actions-cell" (click)="$event.stopPropagation()">
                  <div class="row-actions">
                    <button class="btn btn-secondary" type="button" (click)="edit($event, platform.id!)">
                      Editar
                    </button>

                    <button class="btn btn-danger" type="button" (click)="deletePlatform($event, platform.id!, platform.name)">
                      Borrar
                    </button>
                  </div>
                </td>




               </tr>
            </tbody>
          </table>
          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="!loading && totalPages > 0">
            <div class="muted">
              Página {{ currentPage + 1 }} de {{ totalPages }} · {{ totalElements }} plataformas
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
          <p>Cargando plataformas...</p>
        </ng-template>

        <ng-template #emptyTpl>
          <p>No hay plataformas registradas.</p>
        </ng-template>
    </div>
    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      title="Eliminar plataforma"
      [message]="'¿Seguro que quieres eliminar la plataforma &quot;' + platformNameToDelete + '&quot;?'"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
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
  confirmDeleteOpen = false;
  platformIdToDelete: string | null = null;
  platformNameToDelete = '';
currentPage = 0;
pageSize = 10;
totalPages = 0;
totalElements = 0;
defaultImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';

  ngOnInit(): void {
    this.loadPlatforms();
  }

loadPlatforms(): void {
  this.loading = true;
  this.errorMessage = '';

  this.platformService.getAll(
    this.searchTerm,
    this.sortField,
    this.sortDir,
    this.currentPage,
    this.pageSize
  ).subscribe({
    next: (response) => {
      this.platforms = response.content;
      this.filteredPlatforms = response.content;
      this.currentPage = response.page;
      this.pageSize = response.size;
      this.totalPages = response.total_pages;
      this.totalElements = response.total_elements;
      this.loading = false;
    },
    error: () => {
      this.errorMessage = 'No se pudo cargar el listado de plataformas.';
      this.loading = false;
    }
  });
}

applyFilter(): void {
  this.currentPage = 0;
  this.loadPlatforms();
}

sort(field: string): void {
  if (this.sortField === field) {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortField = field;
    this.sortDir = 'asc';
  }

  this.currentPage = 0;
  this.loadPlatforms();
}

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }

    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  view(id: string): void {
    this.router.navigate(['inventory', 'platforms', id]);
  }

edit(event: Event, id: string): void {
  event.stopPropagation();
  this.router.navigate(['inventory', 'platforms', id, 'edit']);
}

deletePlatform(event: Event, id: string, name: string): void {
  event.stopPropagation();
  this.platformIdToDelete = id;
  this.platformNameToDelete = name;
  this.confirmDeleteOpen = true;
}

openPlatform(id: string): void {
  this.router.navigate(['inventory', 'platforms', id]);
}
cancelDelete(): void {
  this.confirmDeleteOpen = false;
  this.platformIdToDelete = null;
  this.platformNameToDelete = '';
}

confirmDelete(): void {
  if (!this.platformIdToDelete) {
    return;
  }

  this.platformService.delete(this.platformIdToDelete).subscribe({
    next: () => {
      this.successMessage = 'Plataforma eliminada correctamente.';
      this.cancelDelete();
      this.loadPlatforms();
    },
    error: () => {
      this.errorMessage = 'No se pudo eliminar la plataforma.';
      this.cancelDelete();
    }
  });
}

goToPreviousPage(): void {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadPlatforms();
  }
}

goToNextPage(): void {
  if (this.currentPage < this.totalPages - 1) {
    this.currentPage++;
    this.loadPlatforms();
  }
}

onImageError(event: Event): void {
  (event.target as HTMLImageElement).src = this.defaultImage;
}

}
