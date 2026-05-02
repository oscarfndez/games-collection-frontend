import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudioDto, StudioService } from '../../../core/studio.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  template: `
    <div>
      <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
          <h1>Listado de estudios</h1>
          <p class="muted">Consulta, crea y gestiona los estudios de desarrollo.</p>
        </div>
        <a class="btn btn-primary" routerLink="/inventory/studios/new">Nuevo estudio</a>
      </div>

      <div class="form-field" style="margin: 16px 0;">
        <label for="search">Buscar estudio</label>
        <input id="search" type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Busca por nombre, descripcion o ubicacion" />
      </div>

      <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

      <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
        <table class="table" *ngIf="studios.length; else emptyTpl">
          <thead>
            <tr>
              <th (click)="sort('name')" class="sortable-header">Nombre <span class="sort-icon">{{ getSortIcon('name') }}</span></th>
              <th (click)="sort('location')" class="sortable-header">Ubicacion <span class="sort-icon">{{ getSortIcon('location') }}</span></th>
              <th>First party</th>
              <th>Juegos</th>
              <th style="width: 240px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let studio of studios" (click)="openStudio(studio.id!)" class="clickable-row">
              <td>{{ studio.name }}</td>
              <td>{{ studio.location }}</td>
              <td>{{ studio.first_party ? 'Si' : 'No' }}</td>
              <td>{{ studio.games_count ?? 0 }}</td>
              <td class="actions-cell" (click)="$event.stopPropagation()">
                <div class="row-actions">
                  <button class="btn btn-secondary" type="button" (click)="edit($event, studio.id!)">Editar</button>
                  <button class="btn btn-danger" type="button" (click)="deleteStudio($event, studio.id!, studio.name)">Borrar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="totalPages > 0">
          <div class="muted">Pagina {{ currentPage + 1 }} de {{ totalPages }} · {{ totalElements }} estudios</div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 0">Anterior</button>
            <button class="btn btn-secondary" type="button" (click)="goToNextPage()" [disabled]="currentPage >= totalPages - 1">Siguiente</button>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl><p>Cargando estudios...</p></ng-template>
      <ng-template #emptyTpl><p>No hay estudios registrados.</p></ng-template>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      title="Eliminar estudio"
      [message]="'¿Seguro que quieres eliminar el estudio &quot;' + studioNameToDelete + '&quot;?'"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class StudiosListComponent implements OnInit {
  private readonly studioService = inject(StudioService);
  private readonly router = inject(Router);

  studios: StudioDto[] = [];
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
  confirmDeleteOpen = false;
  studioIdToDelete: string | null = null;
  studioNameToDelete = '';

  ngOnInit(): void {
    this.loadStudios();
  }

  loadStudios(): void {
    this.loading = true;
    this.errorMessage = '';
    this.studioService.getAll(this.searchTerm, this.sortField, this.sortDir, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.studios = response.content;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalPages = response.total_pages;
        this.totalElements = response.total_elements;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el listado de estudios.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadStudios();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
    this.loadStudios();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  openStudio(id: string): void {
    this.router.navigate(['inventory', 'studios', id]);
  }

  edit(event: Event, id: string): void {
    event.stopPropagation();
    this.router.navigate(['inventory', 'studios', id, 'edit']);
  }

  deleteStudio(event: Event, id: string, name: string): void {
    event.stopPropagation();
    this.studioIdToDelete = id;
    this.studioNameToDelete = name;
    this.confirmDeleteOpen = true;
  }

  cancelDelete(): void {
    this.confirmDeleteOpen = false;
    this.studioIdToDelete = null;
    this.studioNameToDelete = '';
  }

  confirmDelete(): void {
    if (!this.studioIdToDelete) {
      return;
    }

    this.studioService.delete(this.studioIdToDelete).subscribe({
      next: () => {
        this.successMessage = 'Estudio eliminado correctamente.';
        this.cancelDelete();
        this.loadStudios();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el estudio.';
        this.cancelDelete();
      }
    });
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadStudios();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadStudios();
    }
  }
}
