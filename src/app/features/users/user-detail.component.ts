import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserDto, UserService } from '../../core/user.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card" *ngIf="user; else stateTpl">
        <h1>{{ user.first_name }} {{ user.last_name }}</h1>
        <p class="muted">Detalle del usuario registrado.</p>

        <div style="margin: 16px 0;">
          <img
            [src]="photoUrl"
            [alt]="user.email"
            style="width: 140px; height: 140px; object-fit: cover; border-radius: 999px; border: 1px solid #d0d7e2;"
          />
        </div>

        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Nombre:</strong> {{ user.first_name }}</p>
        <p><strong>Apellidos:</strong> {{ user.last_name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Rol:</strong> {{ user.role }}</p>

        <div class="actions" style="margin-top: 24px;">
          <a class="btn btn-secondary" routerLink="/users">Volver</a>
          <a class="btn btn-primary" [routerLink]="['/users', user.id, 'edit']">Editar</a>
        </div>
      </div>

      <ng-template #stateTpl>
        <div class="card">
          <div *ngIf="loading">Cargando detalle del usuario...</div>
          <div *ngIf="!loading && errorMessage" class="status-error">{{ errorMessage }}</div>
        </div>
      </ng-template>
    </div>
  `
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  user?: UserDto;
  loading = true;
  errorMessage = '';
  photoUrl = 'assets/images/profile.png';
  private objectUrl?: string;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.errorMessage = 'No se ha indicado el identificador del usuario.';
      return;
    }

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loadPhoto(user);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle del usuario.';
        this.loading = false;
      }
    });
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
