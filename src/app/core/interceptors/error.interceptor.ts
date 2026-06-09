import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if ([401, 403].includes(err.status)) {
        authService.logout();
      }

      // Handle standard API response error formatting
      const errorMsg = err.error?.message || err.error?.errors?.[0] || err.statusText || 'An error occurred';
      return throwError(() => new Error(errorMsg));
    })
  );
};
