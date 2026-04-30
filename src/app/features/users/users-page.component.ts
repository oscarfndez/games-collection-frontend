import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDto, UserService } from '../../core/user.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <div class="card">
        <div class="actions" style="justify-content: space-between; align-items: center;">
          <div>
            <h1>Listado de usuarios</h1>
            <p class="muted">Consulta y gestiona los usuarios registrados.</p>
          </div>
        </div>

        <div class="form-field" style="margin: 16px 0;">
          <label for="search">Buscar usuario</label>
          <input
            id="search"
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            placeholder="Busca por nombre, apellidos, email o rol"
          />
        </div>

        <div *ngIf="errorMessage" class="status-error" style="margin: 16px 0;">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="status-success" style="margin: 16px 0;">{{ successMessage }}</div>

        <div class="table-wrapper" *ngIf="!loading; else loadingTpl">
          <table class="table" *ngIf="users.length; else emptyTpl">
            <thead>
              <tr>
                <th (click)="sort('firstName')" class="sortable-header">
                  <span>Nombre</span>
                  <span class="sort-icon">{{ getSortIcon('firstName') }}</span>
                </th>
                <th (click)="sort('lastName')" class="sortable-header">
                  <span>Apellidos</span>
                  <span class="sort-icon">{{ getSortIcon('lastName') }}</span>
                </th>
                <th (click)="sort('email')" class="sortable-header">
                  <span>Email</span>
                  <span class="sort-icon">{{ getSortIcon('email') }}</span>
                </th>
                <th (click)="sort('role')" class="sortable-header">
                  <span>Rol</span>
                  <span class="sort-icon">{{ getSortIcon('role') }}</span>
                </th>
                <th style="width: 120px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users" (click)="openUser(user.id!)" class="clickable-row">
                <td>{{ user.first_name }}</td>
                <td>{{ user.last_name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td class="actions-cell" (click)="$event.stopPropagation()">
                  <div class="row-actions">
                    <button class="btn btn-secondary" type="button" (click)="edit($event, user.id!)">
                      Editar
                    </button>

                    <button class="btn btn-danger" type="button" (click)="deleteUser($event, user.id!, user.email)">
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="actions" style="justify-content: space-between; align-items: center; margin-top: 16px;" *ngIf="totalPages > 0">
            <div class="muted">
              Página {{ currentPage + 1 }} de {{ totalPages }} · {{ totalElements }} usuarios
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
          <p>Cargando usuarios...</p>
        </ng-template>

        <ng-template #emptyTpl>
          <p>No hay usuarios registrados.</p>
        </ng-template>
      </div>
    </div>

    <app-confirm-dialog
      [open]="confirmDeleteOpen"
      title="Eliminar usuario"
      [message]="'¿Seguro que quieres eliminar el usuario &quot;' + userEmailToDelete + '&quot;?'"
      (cancel)="cancelDelete()"
      (confirm)="confirmDelete()">
    </app-confirm-dialog>
  `
})
export class UsersPageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  users: UserDto[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  sortField = 'firstName';
  sortDir = 'asc';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  confirmDeleteOpen = false;
  userIdToDelete: string | null = null;
  userEmailToDelete = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAll(this.searchTerm, this.sortField, this.sortDir, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.users = response.content;
          this.currentPage = response.page;
          this.pageSize = response.size;
          this.totalPages = response.total_pages;
          this.totalElements = response.total_elements;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar el listado de usuarios.';
          this.loading = false;
        }
      });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.currentPage = 0;
    this.loadUsers();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }

    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  openUser(id: string): void {
    this.router.navigate(['users', id]);
  }

  edit(event: Event, id: string): void {
    event.stopPropagation();
    this.router.navigate(['users', id, 'edit']);
  }

  deleteUser(event: Event, id: string, email: string): void {
    event.stopPropagation();
    this.userIdToDelete = id;
    this.userEmailToDelete = email;
    this.confirmDeleteOpen = true;
  }

  cancelDelete(): void {
    this.confirmDeleteOpen = false;
    this.userIdToDelete = null;
    this.userEmailToDelete = '';
  }

  confirmDelete(): void {
    if (!this.userIdToDelete) {
      return;
    }

    this.userService.delete(this.userIdToDelete).subscribe({
      next: () => {
        this.successMessage = 'Usuario eliminado correctamente.';
        this.cancelDelete();
        this.loadUsers();
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el usuario.';
        this.cancelDelete();
      }
    });
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }
}
