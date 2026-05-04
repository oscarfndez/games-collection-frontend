import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/auth.service';
import { I18nService, SupportedLanguage } from './core/i18n.service';
import { TranslatePipe } from './core/translate.pipe';
import { UserService, WhoAmI } from './core/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TranslatePipe],
  template: `
    <header class="topbar" *ngIf="isAuthenticated()">
      <div class="topbar-content">
        <div>
          <strong>{{ 'app.name' | translate }}</strong>
        </div>

        <div class="topbar-actions">
          <div class="menu-container">
            <button
              class="menu-toggle-btn"
              type="button"
              (click)="toggleAppsMenu($event)"
              [attr.aria-label]="'menu.open' | translate"
              [title]="'menu.title' | translate">
              <img [src]="loggedUserPhotoUrl" [alt]="displayName || user?.email || ('menu.users' | translate)" />
            </button>

            <div class="apps-panel" *ngIf="appsMenuOpen" (click)="$event.stopPropagation()">
              <button
                class="apps-close-btn"
                type="button"
                [attr.aria-label]="'menu.close' | translate"
                (click)="closeAppsMenu()">
                ×
              </button>

              <div class="apps-user-header" *ngIf="user">
                <div class="apps-user-email">{{ user.email }}</div>
                <img class="apps-user-photo" [src]="loggedUserPhotoUrl" [alt]="displayName || user.email" />
                <div class="apps-user-name">
                  {{ 'menu.greeting' | translate: { name: firstName || displayName } }}
                </div>
                <div class="apps-user-fullname">{{ displayName }}</div>
                <div class="apps-user-role">{{ roleLabel }}</div>
              </div>

              <div class="apps-actions-card">
                <a class="app-row" *ngIf="isAdmin" routerLink="/inventory" (click)="closeAppsMenu()">
                  <img [src]="inventoryIcon" [alt]="'menu.inventory' | translate" />
                  <span>{{ 'menu.inventory' | translate }}</span>
                </a>

                <a class="app-row" routerLink="/collection" (click)="closeAppsMenu()">
                  <img [src]="gamesIcon" [alt]="'menu.collection' | translate" />
                  <span>{{ 'menu.collection' | translate }}</span>
                </a>

                <a class="app-row" *ngIf="isAdmin" routerLink="/users" (click)="closeAppsMenu()">
                  <img [src]="usersIcon" [alt]="'menu.users' | translate" />
                  <span>{{ 'menu.users' | translate }}</span>
                </a>

                <div class="language-row">
                  <label for="languageSelector">{{ 'menu.language' | translate }}</label>
                  <select id="languageSelector" [value]="currentLanguage" (change)="changeLanguage($event)">
                    <option value="es">{{ 'languages.es' | translate }}</option>
                    <option value="en">{{ 'languages.en' | translate }}</option>
                  </select>
                </div>

                <button class="app-row app-row-button" type="button" (click)="logoutFromMenu()">
                  <img [src]="exitIcon" [alt]="'menu.logout' | translate" />
                  <span>{{ 'menu.logout' | translate }}</span>
                </button>
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
      background: #e8eef7;
      border: 1px solid rgba(148, 163, 184, 0.42);
      border-radius: 28px;
      box-shadow: 0 22px 55px rgba(15, 23, 42, 0.24);
      color: #1f2937;
      min-width: 360px;
      overflow: hidden;
      padding: 18px 20px 20px;
    }

    .apps-close-btn {
      align-items: center;
      background: transparent;
      border: none;
      border-radius: 999px;
      color: #475569;
      display: inline-flex;
      font-size: 2rem;
      height: 38px;
      justify-content: center;
      line-height: 1;
      position: absolute;
      right: 18px;
      top: 18px;
      transition: background-color 0.15s ease, color 0.15s ease;
      width: 38px;
    }

    .apps-close-btn:hover {
      background: rgba(100, 116, 139, 0.14);
      color: #0f172a;
    }

    .apps-user-header {
      align-items: center;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px 18px 20px;
      text-align: center;
    }

    .apps-user-photo {
      background: white;
      border: 4px solid #2563eb;
      border-radius: 999px;
      box-shadow: 0 0 0 4px #22c55e, 0 14px 34px rgba(15, 23, 42, 0.18);
      height: 104px;
      margin-top: 16px;
      object-fit: cover;
      width: 104px;
    }

    .apps-user-name {
      color: #0f172a;
      font-size: 1.65rem;
      font-weight: 500;
      margin-top: 10px;
    }

    .apps-user-fullname {
      color: #334155;
      font-size: 0.98rem;
      font-weight: 700;
    }

    .apps-user-email {
      color: #1f2937;
      font-size: 0.98rem;
      font-weight: 700;
      max-width: 250px;
      word-break: break-word;
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

    .apps-actions-card {
      background: white;
      border-radius: 24px;
      box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.75);
      overflow: hidden;
    }

    .app-row {
      align-items: center;
      background: white;
      border: none;
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
      display: flex;
      gap: 16px;
      padding: 16px 20px;
      text-align: left;
      transition: background-color 0.15s ease;
      width: 100%;
    }

    .app-row:last-child {
      border-bottom: none;
    }

    .app-row:hover {
      background: #f8fafc;
    }

    .app-row img {
      border-radius: 12px;
      height: 38px;
      object-fit: cover;
      width: 38px;
    }

    .app-row span {
      font-size: 1rem;
      font-weight: 700;
    }

    .app-row-button {
      cursor: pointer;
      font-family: inherit;
    }

    .language-row {
      align-items: center;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      gap: 14px;
      justify-content: space-between;
      padding: 14px 20px;
    }

    .language-row label {
      color: #475569;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .language-row select {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      color: #0f172a;
      font: inherit;
      font-weight: 700;
      padding: 7px 12px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);
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

  get currentLanguage(): SupportedLanguage {
    return this.i18nService.language();
  }

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

  get firstName(): string {
    return this.user?.first_name?.trim() ?? '';
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

  changeLanguage(event: Event): void {
    const language = (event.target as HTMLSelectElement).value as SupportedLanguage;
    void this.i18nService.setLanguage(language);
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
