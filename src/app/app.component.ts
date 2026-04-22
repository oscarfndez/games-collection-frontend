import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
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

    <ng-container *ngIf="isAuthenticated(); else authContent">
      <main class="app-shell">
        <div class="app-panel">
          <nav class="panel-tabs">
            <a
              routerLink="/games"
              routerLinkActive="active-tab"
              [routerLinkActiveOptions]="{ exact: false }"
              class="tab-link">
              Juegos
            </a>

            <a
              routerLink="/platforms"
              routerLinkActive="active-tab"
              [routerLinkActiveOptions]="{ exact: false }"
              class="tab-link">
              Plataformas
            </a>
          </nav>

          <div class="panel-content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </ng-container>

    <ng-template #authContent>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }
}