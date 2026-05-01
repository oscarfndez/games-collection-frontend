import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from './user.service';

export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.whoAmI().pipe(
    map((user) => isAdmin(user.role) ? true : router.createUrlTree(['/forbidden'])),
    catchError(() => of(router.createUrlTree(['/forbidden'])))
  );
};

function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
}
