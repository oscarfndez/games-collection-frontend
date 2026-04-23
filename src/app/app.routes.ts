import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './features/auth/login.component';

import { InventoryShellComponent } from './features/inventory/inventory-shell.component';

import { GamesListComponent } from './features/games/games-list.component';
import { GameDetailComponent } from './features/games/game-detail.component';
import { GameFormComponent } from './features/games/game-form.component';

import { PlatformsListComponent } from './features/platforms/platforms-list.component';
import { PlatformDetailComponent } from './features/platforms/platform-detail.component';
import { PlatformFormComponent } from './features/platforms/platform-form.component';

import { ProfilePageComponent } from './features/profile/profile-page.component';
import { UsersPageComponent } from './features/users/users-page.component';
import { CollectionPageComponent } from './features/collection/collection-page.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'inventory',
    component: InventoryShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'games' },

      { path: 'games', component: GamesListComponent },
      { path: 'games/new', component: GameFormComponent },
      { path: 'games/:id', component: GameDetailComponent },
      { path: 'games/:id/edit', component: GameFormComponent },

      { path: 'platforms', component: PlatformsListComponent },
      { path: 'platforms/new', component: PlatformFormComponent },
      { path: 'platforms/:id', component: PlatformDetailComponent },
      { path: 'platforms/:id/edit', component: PlatformFormComponent }
    ]
  },

  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersPageComponent, canActivate: [authGuard] },
  { path: 'collection', component: CollectionPageComponent, canActivate: [authGuard] },

  { path: '', pathMatch: 'full', redirectTo: 'inventory/games' },
  { path: '**', redirectTo: 'inventory/games' }
];