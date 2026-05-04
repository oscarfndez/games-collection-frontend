import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n.service';
import { PlatformDto, PlatformService } from '../../../core/platform.service';
import { TranslatePipe } from '../../../core/translate.pipe';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent, TranslatePipe],
  template: `
    <div>
      <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
          <h1>{{ 'pages.platforms.title' | translate }}</h1>
          <p class="muted">{{ 'pages.platforms.subtitle' | translate }}</p>
        </div>
        <a class="btn btn-primary" routerLink="/inventory/platforms/new">{{ 'pages.platforms.new' | translate }}</a>
      </div>

      <div class="form-field" style="margin: 16px 0;">
        <label for="search">{{ 'pages.platforms.search' | translate }}</label>
        <input id="search" type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" [placeholder]="'pages.platforms.searchPlaceholder' | translate" />
      </div>

      <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

      <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
        <table class="table" *ngIf="filteredPlatforms.length; else emptyTpl">
          <thead>
            <tr>
              <th>{{ 'common.image' | translate }}</th>
              <th (click)="sort('name')" class="sortable-header">
                <span>{{ 'common.name' | translate }}</span>
                <span class="sort-icon">{{ getSortIcon('name') }}</span>
              </th>
              <th (click)="sort('description')" class="sortable-header">
                <span>{{ 'common.description' | translate }}</span>
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
                  <button class="btn btn-secondary" type="button" (click)="edit($event, platform.id!)">{{ 'common.edit' | translate }}</button>
                  <button class="btn btn-danger" type="button" (click)="deletePlatform($event, platform.id!, platform.name)">{{ 'common.delete' | translate }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="!loading && totalPages > 0">
          <div class="muted">
            {{ 'common.pageInfo' | translate: { page: currentPage + 1, totalPages: totalPages, totalElements: totalElements, items: ('pages.platforms.items' | translate) } }}
          </div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 0">{{ 'common.previous' | translate }}</button>
            <button class="btn btn-secondary" type="button" (click)="goToNextPage()" [disabled]="currentPage >= totalPages - 1">{{ 'common.next' | translate }}</button>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl><p>{{ 'pages.platforms.loading' | translate }}</p></ng-template>
      <ng-template #emptyTpl><p>{{ 'pages.platforms.empty' | translate }}</p></ng-template>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      [title]="'confirm.deletePlatformTitle' | translate"
      [message]="'confirm.deletePlatformMessage' | translate: { name: platformNameToDelete }"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class PlatformsListComponent implements OnInit {
  private readonly platformService = inject(PlatformService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);

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

    this.platformService.getAll(this.searchTerm, this.sortField, this.sortDir, this.currentPage, this.pageSize).subscribe({
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
        this.errorMessage = this.i18nService.translate('pages.platforms.loadError');
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
        this.successMessage = this.i18nService.translate('pages.platforms.deleteSuccess');
        this.cancelDelete();
        this.loadPlatforms();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.platforms.deleteError');
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
