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
      <header class="topbar">
        <div class="topbar-content">
          <a routerLink="/games"><strong>Game Collection</strong></a>
            <div class="actions">
                <a class="btn btn-secondary" routerLink="/games">Juegos</a>
                <a class="btn btn-secondary" routerLink="/platforms">Plataformas</a>
                <a class="btn btn-primary" routerLink="/games/new">Nuevo juego</a>
                <a class="btn btn-primary" routerLink="/platforms/new">Nueva plataforma</a>
                <button class="btn btn-danger" type="button" (click)="logout()">Cerrar sesión</button>
            </div>
        </div>
      </header>
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