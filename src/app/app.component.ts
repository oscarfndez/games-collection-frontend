import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <ng-container *ngIf="isAuthenticated(); else loginOnly">
<header class="topbar" *ngIf="isAuthenticated()">
  <div class="topbar-content">
    <div>
      <strong>Game Collection</strong>
    </div>

    <div class="actions">
      <button class="btn btn-danger" type="button" (click)="logout()">Cerrar sesión</button>
    </div>
  </div>
</header>

<nav class="section-tabs" *ngIf="isAuthenticated()">
  <div class="section-tabs-content">
<a routerLink="/games" routerLinkActive="active-tab" [routerLinkActiveOptions]="{ exact: false }" class="tab-link">Juegos</a>
<a routerLink="/platforms" routerLinkActive="active-tab" [routerLinkActiveOptions]="{ exact: false }" class="tab-link">Plataformas</a>
  </div>
</nav>

<router-outlet></router-outlet>
    </ng-container>

    <ng-template #loginOnly>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}