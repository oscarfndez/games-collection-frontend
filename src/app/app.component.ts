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
              <img [src]="loggedUserPhotoUrl" [alt]="displayName || user?.email || 'Usuario'" />
            </button>

<div class="apps-panel" *ngIf="appsMenuOpen" (click)="$event.stopPropagation()">
  <div class="apps-user-header" *ngIf="user">
    <img class="apps-user-photo" [src]="loggedUserPhotoUrl" [alt]="displayName || user.email" />
    <div class="apps-user-name">{{ displayName }}</div>
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
  `,
  styles: [`
    .menu-toggle-btn {
      align-items: center;
      background: transparent;
      border: 2px solid transparent;
      border-radius: 999px;
      cursor: pointer;
      display: inline-flex;
      height: 44px;
      justify-content: center;
      padding: 2px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
      width: 44px;
    }

    .menu-toggle-btn:hover {
      border-color: #2563eb;
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.18);
      transform: translateY(-1px);
    }

    .menu-toggle-btn img {
      border-radius: 999px;
      height: 36px;
      object-fit: cover;
      width: 36px;
    }

    .apps-panel {
      min-width: 330px;
    }

    .apps-user-header {
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 22px 18px 18px;
      text-align: center;
    }

    .apps-user-photo {
      border: 3px solid #e2e8f0;
      border-radius: 999px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
      height: 96px;
      object-fit: cover;
      width: 96px;
    }

    .apps-user-name {
      color: #0f172a;
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 8px;
    }

    .apps-user-email {
      color: #475569;
      font-size: 0.92rem;
    }

    .apps-user-role {
      background: #e0ecff;
      border-radius: 999px;
      color: #1d4ed8;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-top: 4px;
      padding: 5px 12px;
      text-transform: uppercase;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private authSubscription?: Subscription;

  appsMenuOpen = false;
  user: WhoAmI | null = null;
  loggedUserPhotoUrl = 'assets/images/profile.png';
  private loggedUserPhotoObjectUrl?: string;

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
      this.resetLoggedUserPhoto();
      this.closeAppsMenu();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.revokeLoggedUserPhotoObjectUrl();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadUser(): void {
    this.userService.whoAmI().subscribe({
      next: (user) => {
        this.user = user;
        this.loadLoggedUserPhoto(user);
      },
      error: () => {
        this.user = null;
        this.resetLoggedUserPhoto();
      }
    });
  }

  get displayName(): string {
    const fullName = [this.user?.first_name, this.user?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || this.user?.email || '';
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
    this.resetLoggedUserPhoto();
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

  private loadLoggedUserPhoto(user: WhoAmI): void {
    if (!user.has_photo) {
      this.resetLoggedUserPhoto();
      return;
    }

    this.userService.getMyPhoto().subscribe({
      next: (blob) => {
        this.revokeLoggedUserPhotoObjectUrl();
        this.loggedUserPhotoObjectUrl = URL.createObjectURL(blob);
        this.loggedUserPhotoUrl = this.loggedUserPhotoObjectUrl;
      },
      error: () => this.resetLoggedUserPhoto()
    });
  }

  private resetLoggedUserPhoto(): void {
    this.revokeLoggedUserPhotoObjectUrl();
    this.loggedUserPhotoUrl = this.profileIcon;
  }

  private revokeLoggedUserPhotoObjectUrl(): void {
    if (this.loggedUserPhotoObjectUrl) {
      URL.revokeObjectURL(this.loggedUserPhotoObjectUrl);
      this.loggedUserPhotoObjectUrl = undefined;
    }
  }
}
