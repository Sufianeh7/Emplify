import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- Importamos HttpClient y HttpHeaders
import { Router } from '@angular/router'; // <-- IMPORTAMOS EL ROUTER

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class HomePage {

  email: string = '';
  password: string = '';

  // Inyectamos el HttpClient en el constructor
  constructor(private http: HttpClient, private router: Router) {}

  hacerLogin() {
    console.log('Intentando conectar con el backend...');

    // 1. Preparamos las credenciales (Spring Security exige que vayan en Base64)
    const credenciales = btoa(this.email + ':' + this.password);

    // 2. Preparamos la cabecera (Header) igual que hacíamos en la pestaña Authorization de Postman
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + credenciales
    });

    // 3. Lanzamos la petición GET a tu backend
    this.http.get('http://localhost:8080/api/empleados/yo', { headers: headers })
      .subscribe({
        next: (respuesta: any) => {
          // Si el backend devuelve un 200 OK, entraremos por aquí
          console.log('¡LOGIN CORRECTO! 🎉');

          // Guardamos los datos del empleado en la memoria del móvil pasándolos a texto
          localStorage.setItem('empleadoLogueado', JSON.stringify(respuesta))

          // Guardamos el token para futuras peticiones
          localStorage.setItem('token', credenciales)

          // ---> ESTA ES LA LÍNEA MÁGICA QUE QUITA EL WARNING <---
          // "Soltamos" cualquier botón o input que estuviera seleccionado
          if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
          }

          // LA MAGIA DE LA NAVEGACIÓN
          // Si todo va bien, le decimos a Ionic que cambie de pantalla
          this.router.navigate(['/inicio']);
          alert('¡Login correcto! Mira la consola.');
        },
        error: (error) => {
          // Si el backend devuelve 401 Unauthorized, entraremos por aquí
          console.error('Error en el login. ¿Contraseña incorrecta?', error);
          alert('Fallo al iniciar sesión. Comprueba tus datos.');
        }
      });
  }
}
