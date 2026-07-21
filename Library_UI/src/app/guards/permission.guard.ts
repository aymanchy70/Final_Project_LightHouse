import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AccountService } from '../services/account';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (!accountService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const required = route.data['permission'] as string | undefined;
  if (required && !accountService.hasPermission(required)) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};
