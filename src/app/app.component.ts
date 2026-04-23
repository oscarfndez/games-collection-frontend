import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
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
                <img [src]="menuIcon" alt="Perfil" />
                <span>Perfil</span>
              </a>

              <a class="app-tile" routerLink="/users" (click)="closeAppsMenu()">
                <img [src]="menuIcon" alt="Usuarios" />
                <span>Usuarios</span>
              </a>

              <a class="app-tile" routerLink="/inventory" (click)="closeAppsMenu()">
                <img [src]="menuIcon" alt="Inventario" />
                <span>Inventario</span>
              </a>

              <a class="app-tile" routerLink="/collection" (click)="closeAppsMenu()">
                <img [src]="menuIcon" alt="Colección" />
                <span>Colección</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  appsMenuOpen = false;
  menuIcon = 'assets/images/profile.png'; // o el icono que quieras reutilizar

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