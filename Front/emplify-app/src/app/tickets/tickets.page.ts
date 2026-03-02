import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { add, timeOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TicketsPage {

  tickets: any[] = [];
  nuevoTitulo: string = '';
  nuevaDescripcion: string = '';

  constructor(private http: HttpClient) {
    addIcons({ add, timeOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  // Usamos ionViewWillEnter para que recargue siempre al entrar a la pantalla
  ionViewWillEnter() {
    this.cargarTickets();
  }

  cargarTickets() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/tickets/mis-tickets', { headers })
      .subscribe({
        next: (res: any) => this.tickets = res,
        error: (err) => console.error('Error al cargar tickets', err)
      });
  }

  crearTicket(modal: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = {
      titulo: this.nuevoTitulo,
      descripcion: this.nuevaDescripcion
      // El backend asigna automáticamente el empleado y el estado PENDIENTE
    };

    this.http.post('http://localhost:8080/api/tickets/nuevo', body, { headers })
      .subscribe({
        next: () => {
          this.cargarTickets(); // Recargamos la lista
          this.nuevoTitulo = '';
          this.nuevaDescripcion = '';
          modal.dismiss(); // Cerramos el modal
        },
        error: (err) => console.error('Error al crear ticket', err)
      });
  }
}
