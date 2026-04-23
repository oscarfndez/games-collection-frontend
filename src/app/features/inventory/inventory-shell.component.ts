import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <main class="app-shell">
      <div class="app-panel">
        <nav class="panel-tabs">
          <a
            routerLink="/inventory/games"
            routerLinkActive="active-tab"
            [routerLinkActiveOptions]="{ exact: false }"
            class="tab-link">
            Juegos
          </a>

          <a
            routerLink="/inventory/platforms"
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
  `
})
export class InventoryShellComponent {}