import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n.service';
import { StudioDto, StudioService } from '../../../core/studio.service';
import { TranslatePipe } from '../../../core/translate.pipe';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent, TranslatePipe],
  template: `
    <div>
      <div class="actions" style="justify-content: space-between; align-items: center;">
        <div>
          <h1>{{ 'pages.studios.title' | translate }}</h1>
          <p class="muted">{{ 'pages.studios.subtitle' | translate }}</p>
        </div>
        <a class="btn btn-primary" routerLink="/inventory/studios/new">{{ 'pages.studios.new' | translate }}</a>
      </div>

      <div class="form-field" style="margin: 16px 0;">
        <label for="search">{{ 'pages.studios.search' | translate }}</label>
        <input id="search" type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" [placeholder]="'pages.studios.searchPlaceholder' | translate" />
      </div>

      <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

      <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
        <table class="table" *ngIf="studios.length; else emptyTpl">
          <thead>
            <tr>
              <th (click)="sort('name')" class="sortable-header">{{ 'common.name' | translate }} <span class="sort-icon">{{ getSortIcon('name') }}</span></th>
              <th (click)="sort('location')" class="sortable-header">{{ 'common.location' | translate }} <span class="sort-icon">{{ getSortIcon('location') }}</span></th>
              <th>{{ 'pages.studios.firstParty' | translate }}</th>
              <th style="width: 240px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let studio of studios" (click)="openStudio(studio.id!)" class="clickable-row">
              <td>{{ studio.name }}</td>
              <td>{{ studio.location }}</td>
              <td>{{ (studio.first_party ? 'common.yes' : 'common.no') | translate }}</td>
              <td class="actions-cell" (click)="$event.stopPropagation()">
                <div class="row-actions">
                  <button class="btn btn-secondary" type="button" (click)="edit($event, studio.id!)">{{ 'common.edit' | translate }}</button>
                  <button class="btn btn-danger" type="button" (click)="deleteStudio($event, studio.id!, studio.name)">{{ 'common.delete' | translate }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="totalPages > 0">
          <div class="muted">
            {{ 'common.pageInfo' | translate: { page: currentPage + 1, totalPages: totalPages, totalElements: totalElements, items: ('pages.studios.items' | translate) } }}
          </div>
          <div class="actions">
            <button class="btn btn-secondary" type="button" (click)="goToPreviousPage()" [disabled]="currentPage === 0">{{ 'common.previous' | translate }}</button>
            <button class="btn btn-secondary" type="button" (click)="goToNextPage()" [disabled]="currentPage >= totalPages - 1">{{ 'common.next' | translate }}</button>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl><p>{{ 'pages.studios.loading' | translate }}</p></ng-template>
      <ng-template #emptyTpl><p>{{ 'pages.studios.empty' | translate }}</p></ng-template>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      [title]="'confirm.deleteStudioTitle' | translate"
      [message]="'confirm.deleteStudioMessage' | translate: { name: studioNameToDelete }"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class StudiosListComponent implements OnInit {
  private readonly studioService = inject(StudioService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);

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
        this.errorMessage = this.i18nService.translate('pages.studios.loadError');
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
        this.successMessage = this.i18nService.translate('pages.studios.deleteSuccess');
        this.cancelDelete();
        this.loadStudios();
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.studios.deleteError');
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
