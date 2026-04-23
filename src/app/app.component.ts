import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { UserService, WhoAmI } from './core/user.service';

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
              <div class="apps-user-header" *ngIf="user">
                <img class="apps-user-avatar" [src]="profileIcon" alt="Usuario" />
                <div class="apps-user-meta">
                  <div class="apps-user-email">{{ user.email }}</div>
                  <div class="apps-user-role">{{ roleLabel }}</div>
                </div>
              </div>

              <div class="apps-grid">
                <a class="app-tile" routerLink="/profile" (click)="closeAppsMenu()">
                  <img [src]="profileIcon" alt="Perfil" />
                  <span>Perfil</span>
                </a>

                <a class="app-tile" routerLink="/users" (click)="closeAppsMenu()">
                  <img [src]="profileIcon" alt="Usuarios" />
                  <span>Usuarios</span>
                </a>

                <a class="app-tile" routerLink="/inventory" (click)="closeAppsMenu()">
                  <img [src]="profileIcon" alt="Inventario" />
                  <span>Inventario</span>
                </a>

                <a class="app-tile" routerLink="/collection" (click)="closeAppsMenu()">
                  <img [src]="profileIcon" alt="Colección" />
                  <span>Colección</span>
                </a>
              </div>

              <div class="apps-footer">
                <button class="btn btn-danger" type="button" (click)="logoutFromMenu()">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  appsMenuOpen = false;
  user: WhoAmI | null = null;

  profileIcon = 'assets/images/profile.png';

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.loadUser();
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadUser(): void {
    this.userService.whoAmI().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: () => {
        this.user = null;
      }
    });
  }

  get roleLabel(): string {
    if (!this.user?.role) {
      return '';
    }

    return this.user.role.replace('ROLE_', '');
  }

  toggleAppsMenu(event: Event): void {
    event.stopPropagation();
    this.appsMenuOpen = !this.appsMenuOpen;
  }

  closeAppsMenu(): void {
    this.appsMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  logoutFromMenu(): void {
    this.closeAppsMenu();
    this.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAppsMenu();
  }
}