import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { GamesListComponent } from './features/games/games-list.component';
import { GameDetailComponent } from './features/games/game-detail.component';
import { GameFormComponent } from './features/games/game-form.component';
import { authGuard } from './core/auth.guard';
import { PlatformsListComponent } from './features/platforms/platforms-list.component';
import { PlatformDetailComponent } from './features/platforms/platform-detail.component';
import { PlatformFormComponent } from './features/platforms/platform-form.component';

export const appRoutes: Routes = [
  { path: 'platforms', component: PlatformsListComponent, canActivate: [authGuard] },
  { path: 'platforms/new', component: PlatformFormComponent, canActivate: [authGuard] },
  { path: 'platforms/:id', component: PlatformDetailComponent, canActivate: [authGuard] },
  { path: 'platforms/:id/edit', component: PlatformFormComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'games', component: GamesListComponent, canActivate: [authGuard] },
  { path: 'games/new', component: GameFormComponent, canActivate: [authGuard] },
  { path: 'games/:id', component: GameDetailComponent, canActivate: [authGuard] },
  { path: 'games/:id/edit', component: GameFormComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'games' },
  { path: '**', redirectTo: 'games' }
];