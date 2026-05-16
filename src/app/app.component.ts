import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/auth.service';
import { I18nService, SupportedLanguage } from './core/i18n.service';
import { NotificationDto, NotificationService } from './core/notification.service';
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
          <div class="notifications-container">
            <button
              class="notification-toggle-btn"
              data-testid="notifications-toggle"
              type="button"
              (click)="toggleNotificationsPanel($event)"
              [attr.aria-label]="'notifications.open' | translate"
              [title]="'notifications.title' | translate">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75Zm2.02-.25 5.48 4.28 5.48-4.28H6.52Zm10.98 11a.25.25 0 0 0 .25-.25V8.4l-5.06 3.95a1.13 1.13 0 0 1-1.38 0L6.25 8.4v8.85c0 .14.11.25.25.25h11Z" />
              </svg>
              <span class="notification-badge" *ngIf="unreadNotifications > 0">{{ unreadNotificationsLabel }}</span>
            </button>

            <div class="notifications-panel" *ngIf="notificationsPanelOpen" data-testid="notifications-panel" (click)="$event.stopPropagation()">
              <div class="notifications-panel-header">
                <div>
                  <h2>{{ 'notifications.title' | translate }}</h2>
                  <p>{{ 'notifications.subtitle' | translate: { count: unreadNotifications } }}</p>
                </div>
                <button
                  class="notifications-close-btn"
                  data-testid="notifications-close"
                  type="button"
                  [attr.aria-label]="'notifications.close' | translate"
                  (click)="closeNotificationsPanel()">
                  &times;
                </button>
              </div>

              <div class="notifications-state" *ngIf="notificationsLoading">{{ 'notifications.loading' | translate }}</div>
              <div class="notifications-state notifications-error" *ngIf="!notificationsLoading && notificationsError">{{ notificationsError }}</div>
              <div class="notifications-state" *ngIf="!notificationsLoading && !notificationsError && !notifications.length">
                {{ 'notifications.empty' | translate }}
              </div>

              <div class="notifications-list" *ngIf="!notificationsLoading && notifications.length">
                <button
                  class="notification-item"
                  data-testid="notification-item"
                  type="button"
                  *ngFor="let notification of notifications"
                  [class.notification-read]="notification.read"
                  (click)="markNotificationAsRead(notification)">
                  <span class="notification-dot" *ngIf="!notification.read"></span>
                  <span class="notification-text">{{ notificationMessage(notification) }}</span>
                  <span class="notification-date">{{ notification.createdAt | date:'short' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="menu-container">
            <button
              class="menu-toggle-btn"
              data-testid="app-menu-toggle"
              type="button"
              (click)="toggleAppsMenu($event)"
              [attr.aria-label]="'menu.open' | translate"
              [title]="'menu.title' | translate">
              <img [src]="loggedUserPhotoUrl" [alt]="displayName || user?.email || ('menu.users' | translate)" />
            </button>

            <div class="apps-panel" *ngIf="appsMenuOpen" data-testid="app-menu-panel" (click)="$event.stopPropagation()">
              <button
                class="apps-close-btn"
                data-testid="app-menu-close"
                type="button"
                [attr.aria-label]="'menu.close' | translate"
                (click)="closeAppsMenu()">
                &times;
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

              <div class="apps-section-card language-card">
                <div class="language-row">
                  <label for="languageSelector">{{ 'menu.language' | translate }}</label>
                  <select id="languageSelector" data-testid="language-selector" [value]="currentLanguage" (change)="changeLanguage($event)">
                    <option value="es">{{ 'languages.es' | translate }}</option>
                    <option value="en">{{ 'languages.en' | translate }}</option>
                  </select>
                </div>
              </div>

              <div class="apps-actions-card">
                <a class="app-row" data-testid="nav-inventory" *ngIf="isAdmin" routerLink="/inventory" (click)="closeAppsMenu()">
                  <img [src]="inventoryIcon" [alt]="'menu.inventory' | translate" />
                  <span>{{ 'menu.inventory' | translate }}</span>
                </a>

                <a class="app-row" data-testid="nav-collection" routerLink="/collection" (click)="closeAppsMenu()">
                  <img [src]="gamesIcon" [alt]="'menu.collection' | translate" />
                  <span>{{ 'menu.collection' | translate }}</span>
                </a>

                <a class="app-row" data-testid="nav-users" *ngIf="isAdmin" routerLink="/users" (click)="closeAppsMenu()">
                  <img [src]="usersIcon" [alt]="'menu.users' | translate" />
                  <span>{{ 'menu.users' | translate }}</span>
                </a>

                <button class="app-row app-row-button" data-testid="nav-logout" type="button" (click)="logoutFromMenu()">
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

    .topbar-actions {
      align-items: center;
      display: flex;
      gap: 12px;
    }

    .notifications-container,
    .menu-container {
      position: relative;
    }

    .notification-toggle-btn {
      align-items: center;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
      color: #2563eb;
      cursor: pointer;
      display: inline-flex;
      height: 44px;
      justify-content: center;
      position: relative;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
      width: 44px;
    }

    .notification-toggle-btn:hover {
      border-color: #2563eb;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
      transform: translateY(-1px);
    }

    .notification-toggle-btn svg {
      fill: currentColor;
      height: 24px;
      width: 24px;
    }

    .notification-badge {
      align-items: center;
      background: #dc2626;
      border: 2px solid white;
      border-radius: 999px;
      color: white;
      display: inline-flex;
      font-size: 0.68rem;
      font-weight: 800;
      height: 22px;
      justify-content: center;
      min-width: 22px;
      padding: 0 5px;
      position: absolute;
      right: -6px;
      top: -7px;
    }

    .notifications-panel {
      background: #f8fafc;
      border: 1px solid rgba(148, 163, 184, 0.42);
      border-radius: 24px;
      box-shadow: 0 22px 55px rgba(15, 23, 42, 0.24);
      color: #1f2937;
      min-width: 380px;
      overflow: hidden;
      padding: 18px;
      position: absolute;
      right: -58px;
      top: 56px;
      z-index: 30;
    }

    .notifications-panel-header {
      align-items: flex-start;
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 12px;
    }

    .notifications-panel-header h2 {
      color: #0f172a;
      font-size: 1.15rem;
      margin: 0;
    }

    .notifications-panel-header p {
      color: #64748b;
      font-size: 0.86rem;
      margin: 5px 0 0;
    }

    .notifications-close-btn {
      align-items: center;
      background: transparent;
      border: none;
      border-radius: 999px;
      color: #475569;
      cursor: pointer;
      display: inline-flex;
      font-size: 1.8rem;
      height: 34px;
      justify-content: center;
      line-height: 1;
      transition: background-color 0.15s ease, color 0.15s ease;
      width: 34px;
    }

    .notifications-close-btn:hover {
      background: rgba(100, 116, 139, 0.14);
      color: #0f172a;
    }

    .notifications-list {
      background: white;
      border-radius: 18px;
      box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.75);
      max-height: 360px;
      overflow: auto;
    }

    .notification-item {
      background: white;
      border: none;
      border-bottom: 1px solid #e5e7eb;
      color: #111827;
      cursor: pointer;
      display: grid;
      gap: 4px 10px;
      grid-template-columns: 10px 1fr;
      padding: 14px 16px;
      text-align: left;
      width: 100%;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background: #f8fafc;
    }

    .notification-read {
      color: #64748b;
    }

    .notification-dot {
      background: #2563eb;
      border-radius: 999px;
      grid-row: 1 / span 2;
      height: 8px;
      margin-top: 6px;
      width: 8px;
    }

    .notification-text {
      font-size: 0.94rem;
      font-weight: 700;
      line-height: 1.35;
    }

    .notification-read .notification-text {
      font-weight: 500;
    }

    .notification-date {
      color: #94a3b8;
      font-size: 0.76rem;
      grid-column: 2;
    }

    .notifications-state {
      background: white;
      border-radius: 18px;
      color: #64748b;
      padding: 18px;
      text-align: center;
    }

    .notifications-error {
      background: #fee2e2;
      color: #991b1b;
      text-align: left;
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

    .apps-section-card,
    .apps-actions-card {
      background: white;
      border-radius: 24px;
      box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.75);
      overflow: hidden;
    }

    .apps-section-card {
      margin-bottom: 12px;
    }

    .language-card {
      background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
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
      display: flex;
      gap: 14px;
      justify-content: space-between;
      padding: 16px 20px;
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
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);
  private authSubscription?: Subscription;
  private notificationsPollingId?: ReturnType<typeof setInterval>;

  appsMenuOpen = false;
  notificationsPanelOpen = false;
  user: WhoAmI | null = null;
  notifications: NotificationDto[] = [];
  unreadNotifications = 0;
  notificationsLoading = false;
  notificationsError = '';
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
      this.notifications = [];
      this.unreadNotifications = 0;
      this.stopNotificationsPolling();
      this.resetLoggedUserPhoto();
      this.closeAppsMenu();
      this.closeNotificationsPanel();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.stopNotificationsPolling();
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
        this.refreshUnreadNotifications();
        this.startNotificationsPolling();
      },
      error: () => {
        this.user = null;
        this.notifications = [];
        this.unreadNotifications = 0;
        this.stopNotificationsPolling();
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

  get unreadNotificationsLabel(): string {
    return this.unreadNotifications > 99 ? '99+' : String(this.unreadNotifications);
  }

  toggleAppsMenu(event: Event): void {
    event.stopPropagation();
    if (this.isAuthenticated() && !this.user) {
      this.loadUser();
    }
    this.closeNotificationsPanel();
    this.appsMenuOpen = !this.appsMenuOpen;
  }

  closeAppsMenu(): void {
    this.appsMenuOpen = false;
  }

  toggleNotificationsPanel(event: Event): void {
    event.stopPropagation();
    this.closeAppsMenu();
    this.notificationsPanelOpen = !this.notificationsPanelOpen;

    if (this.notificationsPanelOpen) {
      this.loadNotifications();
    }
  }

  closeNotificationsPanel(): void {
    this.notificationsPanelOpen = false;
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
    this.closeNotificationsPanel();
  }

  notificationMessage(notification: NotificationDto): string {
    return this.i18nService.translate(notification.messageKey, this.parseNotificationParams(notification.paramsJson));
  }

  markNotificationAsRead(notification: NotificationDto): void {
    if (notification.read || !this.user?.id) {
      return;
    }

    this.notificationService.markAsRead(notification.id, this.user.id).subscribe({
      next: (updatedNotification) => {
        notification.read = true;
        notification.readAt = updatedNotification.readAt;
        this.refreshUnreadNotifications();
      }
    });
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

  private loadNotifications(): void {
    if (!this.user?.id) {
      return;
    }

    this.notificationsLoading = true;
    this.notificationsError = '';
    this.notificationService.getForUser(this.user.id, 0, 10).subscribe({
      next: (page) => {
        this.notifications = page.content;
        this.notificationsLoading = false;
      },
      error: () => {
        this.notifications = [];
        this.notificationsLoading = false;
        this.notificationsError = this.i18nService.translate('notifications.loadError');
      }
    });
  }

  private refreshUnreadNotifications(): void {
    if (!this.user?.id) {
      return;
    }

    this.notificationService.getUnreadCount(this.user.id).subscribe({
      next: (response) => {
        this.unreadNotifications = response.unread;
      },
      error: () => {
        this.unreadNotifications = 0;
      }
    });
  }

  private startNotificationsPolling(): void {
    this.stopNotificationsPolling();
    this.notificationsPollingId = setInterval(() => this.refreshUnreadNotifications(), 60000);
  }

  private stopNotificationsPolling(): void {
    if (this.notificationsPollingId) {
      clearInterval(this.notificationsPollingId);
      this.notificationsPollingId = undefined;
    }
  }

  private parseNotificationParams(paramsJson: string): Record<string, string | number | undefined> {
    try {
      const params = JSON.parse(paramsJson) as Record<string, string | number | undefined>;
      return params && typeof params === 'object' ? params : {};
    } catch {
      return {};
    }
  }
}
