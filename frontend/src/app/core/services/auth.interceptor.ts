import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  console.log('🔒 Interceptor - URL:', req.url);
  console.log('🔒 Interceptor - Token exists:', !!token);
  
  if (token) {
    console.log('🔒 Interceptor - Token (first 20 chars):', token.substring(0, 20) + '...');
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔒 Interceptor - Authorization header added');
    return next(cloned);
  }
  
  console.log('⚠️ Interceptor - No token found, request sent without Authorization header');
  return next(req);
};
