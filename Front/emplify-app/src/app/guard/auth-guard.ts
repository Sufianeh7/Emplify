import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      // Si hay token, le dejamos pasar
      return true;
    } else {
      // Si no hay token, lo mandamos al login
      this.router.navigate(['/home']); // O la ruta que uses para tu login ('/login')
      return false;
    }
  }
}
