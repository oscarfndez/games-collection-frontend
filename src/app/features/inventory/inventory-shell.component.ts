import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <main class="app-shell">
      <div class="app-panel">
        <nav class="panel-tabs">
          <a
            data-testid="inventory-tab-games"
            routerLink="/inventory/games"
            routerLinkActive="active-tab"
            [routerLinkActiveOptions]="{ exact: false }"
            class="tab-link">
            {{ 'inventory.games' | translate }}
          </a>

          <a
            data-testid="inventory-tab-platforms"
            routerLink="/inventory/platforms"
            routerLinkActive="active-tab"
            [routerLinkActiveOptions]="{ exact: false }"
            class="tab-link">
            {{ 'inventory.platforms' | translate }}
          </a>

          <a
            data-testid="inventory-tab-studios"
            routerLink="/inventory/studios"
            routerLinkActive="active-tab"
            [routerLinkActiveOptions]="{ exact: false }"
            class="tab-link">
            {{ 'inventory.studios' | translate }}
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
