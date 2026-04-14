import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { GamesListComponent } from './features/games/games-list.component';
import { GameDetailComponent } from './features/games/game-detail.component';
import { GameFormComponent } from './features/games/game-form.component';
import { authGuard } from './core/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'games', component: GamesListComponent, canActivate: [authGuard] },
  { path: 'games/new', component: GameFormComponent, canActivate: [authGuard] },
  { path: 'games/:id', component: GameDetailComponent, canActivate: [authGuard] },
  { path: 'games/:id/edit', component: GameFormComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'games' },
  { path: '**', redirectTo: 'games' }
];