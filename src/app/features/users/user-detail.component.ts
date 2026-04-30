import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  user?: UserDto;
  loading = true;
  errorMessage = '';

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
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle del usuario.';
        this.loading = false;
      }
    });
  }
}
