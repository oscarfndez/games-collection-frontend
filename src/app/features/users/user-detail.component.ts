import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CollectionService, GameItemDto } from '../../core/collection.service';
import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { UserDto, UserService } from '../../core/user.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="user; else stateTpl">
        <h1>{{ user.first_name }} {{ user.last_name }}</h1>
        <p class="muted">{{ 'pages.users.detailsSubtitle' | translate }}</p>

        <div style="margin: 16px 0;">
          <img
            [src]="photoUrl"
            [alt]="'pages.users.photoAlt' | translate: { email: user.email }"
            style="width: 140px; height: 140px; object-fit: cover; border-radius: 999px; border: 1px solid #d0d7e2;"
          />
        </div>

        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>{{ 'common.firstName' | translate }}:</strong> {{ user.first_name }}</p>
        <p><strong>{{ 'common.lastName' | translate }}:</strong> {{ user.last_name }}</p>
        <p><strong>{{ 'common.email' | translate }}:</strong> {{ user.email }}</p>
        <p><strong>{{ 'common.role' | translate }}:</strong> {{ user.role }}</p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/users">{{ 'common.back' | translate }}</a>
          <a class="btn btn-primary" [routerLink]="['/users', user.id, 'edit']">{{ 'common.edit' | translate }}</a>
        </div>
      </div>

      <div class="card" style="margin-top: 16px;" *ngIf="user">
        <h2>{{ 'pages.users.collectionTitle' | translate }}</h2>

        <div class="form-field" style="margin: 16px 0;">
          <label for="userCollectionSearch">{{ 'pages.collection.search' | translate }}</label>
          <input
            id="userCollectionSearch"
            data-testid="user-collection-search"
            type="text"
            [(ngModel)]="collectionSearchTerm"
            (input)="applyCollectionFilter()"
            [placeholder]="'pages.collection.searchPlaceholder' | translate"
          />
        </div>

        <div *ngIf="collectionErrorMessage" class="status-error" style="margin: 16px 0;">
          {{ collectionErrorMessage }}
        </div>

        <div *ngIf="collectionLoading">{{ 'pages.collection.loading' | translate }}</div>
        <div *ngIf="!collectionLoading && !collectionItems.length" class="muted">
          {{ 'pages.users.collectionEmpty' | translate }}
        </div>

        <div class="table-wrapper" *ngIf="!collectionLoading && collectionItems.length">
          <table class="table" data-testid="user-collection-table">
            <thead>
              <tr>
                <th>{{ 'common.image' | translate }}</th>
                <th (click)="sortCollection('game')" class="sortable-header">
                  <span>{{ 'pages.collection.game' | translate }}</span>
                  <span class="sort-icon">{{ getCollectionSortIcon('game') }}</span>
                </th>
                <th (click)="sortCollection('platform')" class="sortable-header">
                  <span>{{ 'pages.games.platform' | translate }}</span>
                  <span class="sort-icon">{{ getCollectionSortIcon('platform') }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of collectionItems" data-testid="user-collection-row">
                <td>
                  <img
                    [src]="item.game_image_url || defaultGameImage"
                    (error)="onGameImageError($event)"
                    [alt]="item.game_name"
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                  />
                </td>
                <td>{{ item.game_name }}</td>
                <td><span class="pill">{{ item.platform_name }}</span></td>
              </tr>
            </tbody>
          </table>

          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="collectionTotalPages > 0">
            <div class="muted">
              {{ 'common.pageInfo' | translate: { page: collectionCurrentPage + 1, totalPages: collectionTotalPages, totalElements: collectionTotalElements, items: ('pages.collection.items' | translate) } }}
            </div>
            <div class="actions">
              <button class="btn btn-secondary" type="button" (click)="goToPreviousCollectionPage()" [disabled]="collectionCurrentPage === 0">
                {{ 'common.previous' | translate }}
              </button>
              <button class="btn btn-secondary" type="button" (click)="goToNextCollectionPage()" [disabled]="collectionCurrentPage >= collectionTotalPages - 1">
                {{ 'common.next' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">{{ 'pages.users.detailLoading' | translate }}</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly collectionService = inject(CollectionService);
  private readonly i18nService = inject(I18nService);

  user?: UserDto;
  loading = true;
  errorMessage = '';
  photoUrl = 'assets/images/profile.png';
  collectionItems: GameItemDto[] = [];
  collectionLoading = false;
  collectionErrorMessage = '';
  collectionSearchTerm = '';
  collectionSortField = 'game';
  collectionSortDir = 'asc';
  collectionCurrentPage = 0;
  collectionPageSize = 5;
  collectionTotalPages = 0;
  collectionTotalElements = 0;
  defaultGameImage = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';
  private objectUrl?: string;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = this.i18nService.translate('pages.users.detailMissingId');
      return;
    }

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loadPhoto(user);
        this.loadCollection(user.id);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.i18nService.translate('pages.users.detailLoadError');
        this.loading = false;
      }
    });
  }

  loadCollection(userId?: string): void {
    if (!userId) {
      return;
    }

    this.collectionLoading = true;
    this.collectionErrorMessage = '';

    this.collectionService.getByUserId(
      userId,
      this.collectionSearchTerm,
      this.collectionSortField,
      this.collectionSortDir,
      this.collectionCurrentPage,
      this.collectionPageSize
    ).subscribe({
      next: (response) => {
        this.collectionItems = response.content;
        this.collectionCurrentPage = response.page;
        this.collectionPageSize = response.size;
        this.collectionTotalPages = response.total_pages;
        this.collectionTotalElements = response.total_elements;
        this.collectionLoading = false;
      },
      error: () => {
        this.collectionErrorMessage = this.i18nService.translate('pages.users.collectionLoadError');
        this.collectionLoading = false;
      }
    });
  }

  applyCollectionFilter(): void {
    this.collectionCurrentPage = 0;
    this.loadCollection(this.user?.id);
  }

  sortCollection(field: string): void {
    if (this.collectionSortField === field) {
      this.collectionSortDir = this.collectionSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.collectionSortField = field;
      this.collectionSortDir = 'asc';
    }

    this.collectionCurrentPage = 0;
    this.loadCollection(this.user?.id);
  }

  getCollectionSortIcon(field: string): string {
    if (this.collectionSortField !== field) {
      return '-';
    }

    return this.collectionSortDir === 'asc' ? '^' : 'v';
  }

  goToPreviousCollectionPage(): void {
    if (this.collectionCurrentPage > 0) {
      this.collectionCurrentPage--;
      this.loadCollection(this.user?.id);
    }
  }

  goToNextCollectionPage(): void {
    if (this.collectionCurrentPage < this.collectionTotalPages - 1) {
      this.collectionCurrentPage++;
      this.loadCollection(this.user?.id);
    }
  }

  onGameImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultGameImage;
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  private loadPhoto(user: UserDto): void {
    if (!user.id || !user.has_photo) {
      return;
    }

    this.userService.getPhoto(user.id).subscribe({
      next: (blob) => {
        if (this.objectUrl) {
          URL.revokeObjectURL(this.objectUrl);
        }
        this.objectUrl = URL.createObjectURL(blob);
        this.photoUrl = this.objectUrl;
      }
    });
  }
}
