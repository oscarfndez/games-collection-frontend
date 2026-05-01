import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { UserService, WhoAmI } from './core/user.service';
import { Subscription } from 'rxjs';

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
    <div class="apps-user-email">{{ user.email }}</div>
    <div class="apps-user-role">{{ roleLabel }}</div>
  </div>

  <div class="apps-grid">

    <a class="app-tile" *ngIf="isAdmin" routerLink="/inventory" (click)="closeAppsMenu()">
      <img [src]="inventoryIcon" alt="Inventario" />
      <span>Inventario</span>
    </a>

    <a class="app-tile" routerLink="/collection" (click)="closeAppsMenu()">
      <img [src]="gamesIcon" alt="Colección" />
      <span>Colección</span>
    </a>

    <a class="app-tile" *ngIf="isAdmin" routerLink="/users" (click)="closeAppsMenu()">
      <img [src]="usersIcon" alt="Usuarios" />
      <span>Usuarios</span>
    </a>

    <a class="app-tile" (click)="logoutFromMenu()">
      <img [src]="exitIcon" alt="Salir" />
      <span>Salir</span>
    </a>

  </div>

</div>


          </div>
        </div>
      </div>
    </header>

    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private authSubscription?: Subscription;

  appsMenuOpen = false;
  user: WhoAmI | null = null;

  profileIcon = 'assets/images/profile.png';
  usersIcon = 'assets/images/users.png';
  inventoryIcon = 'assets/images/inventory.png';
  gamesIcon = 'assets/images/games.png';
  exitIcon = 'assets/images/exit.png';

  ngOnInit(): void {
    this.authSubscription = this.authService.authenticated$.subscribe((authenticated) => {
      if (authenticated) {
        this.loadUser();
        return;
      }

      this.user = null;
      this.closeAppsMenu();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
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

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'ROLE_ADMIN';
  }

  toggleAppsMenu(event: Event): void {
    event.stopPropagation();
    if (this.isAuthenticated() && !this.user) {
      this.loadUser();
    }
    this.appsMenuOpen = !this.appsMenuOpen;
  }

  closeAppsMenu(): void {
    this.appsMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
