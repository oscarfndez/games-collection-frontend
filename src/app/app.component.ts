import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
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

        <div class="topbar-actions">
          <button class="btn btn-danger" type="button" (click)="logout()">Cerrar sesión</button>

          <div class="menu-container">
            <button
              class="menu-toggle-btn"
              type="button"
              (click)="toggleAppsMenu($event)"
              aria-label="Abrir menú"
              title="Menú">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="6" cy="6" r="1.6"></circle>
                <circle cx="12" cy="6" r="1.6"></circle>
                <circle cx="18" cy="6" r="1.6"></circle>
                <circle cx="6" cy="12" r="1.6"></circle>
                <circle cx="12" cy="12" r="1.6"></circle>
                <circle cx="18" cy="12" r="1.6"></circle>
                <circle cx="6" cy="18" r="1.6"></circle>
                <circle cx="12" cy="18" r="1.6"></circle>
                <circle cx="18" cy="18" r="1.6"></circle>
              </svg>
            </button>

            <div class="apps-panel" *ngIf="appsMenuOpen" (click)="$event.stopPropagation()">
              <a class="app-tile" routerLink="/profile" (click)="closeAppsMenu()">
                <img [src]="profileIcon" alt="Perfil" />
                <span>Perfil</span>
              </a>

              <a class="app-tile" routerLink="/users" (click)="closeAppsMenu()">
                <img [src]="usersIcon" alt="Usuarios" />
                <span>Usuarios</span>
              </a>

              <a class="app-tile" routerLink="/inventory" (click)="closeAppsMenu()">
                <img [src]="inventoryIcon" alt="Inventario" />
                <span>Inventario</span>
              </a>

              <a class="app-tile" routerLink="/collection" (click)="closeAppsMenu()">
                <img [src]="gamesIcon" alt="Colección" />
                <span>Colección</span>
              </a>
            </div>
          </div>
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

  appsMenuOpen = false;

  menuIcon = 'https://thumbs.dreamstime.com/b/photo-not-available-icon-isolated-white-background-your-web-mobile-app-design-133861179.jpg?w=768';
  profileIcon = '/assets/images/profile.png';
  usersIcon = '/assets/images/users.png';
  inventoryIcon = '/assets/images/inventory.png';
  gamesIcon = '/assets/images/mes.png';

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleAppsMenu(event: Event): void {
    event.stopPropagation();
    this.appsMenuOpen = !this.appsMenuOpen;
  }

  closeAppsMenu(): void {
    this.appsMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAppsMenu();
  }
}