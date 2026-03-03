import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { add, timeOutline, checkmarkCircleOutline, alertCircleOutline, sendOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TicketsPage {

  tickets: any[] = [];
  nuevoTitulo: string = '';
  nuevaDescripcion: string = '';

  // Variables para la funcionalidad de Chat
  ticketSeleccionado: any = null;
  nuevoMensajeChat: string = '';

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      add, timeOutline, checkmarkCircleOutline, alertCircleOutline,
      sendOutline, arrowBackOutline
    });
  }

  ionViewWillEnter() {
    this.cargarTickets();
  }

  cargarTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get('http://localhost:8080/api/tickets/mis-tickets', { headers })
      .subscribe({
        next: (res: any) => {
          this.tickets = res;
          // Si tenemos un ticket abierto, actualizamos su referencia para ver mensajes nuevos
          if (this.ticketSeleccionado) {
            this.ticketSeleccionado = this.tickets.find(t => t.idTicket === this.ticketSeleccionado.idTicket);
          }
        },
        error: (err) => console.error('Error al cargar tickets', err)
      });
  }

  // --- Lógica para el Chat de Soporte ---

  abrirChat(ticket: any) {
    this.ticketSeleccionado = ticket;
  }

  cerrarChat() {
    this.ticketSeleccionado = null;
    this.nuevoMensajeChat = '';
  }

  enviarMensajeChat() {
    if (!this.nuevoMensajeChat.trim()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    // Enviamos el contenido al endpoint de mensajes que creamos en el controlador
    const body = { contenido: this.nuevoMensajeChat };

    this.http.post(`http://localhost:8080/api/tickets/${this.ticketSeleccionado.idTicket}/enviar-mensaje`, body, { headers })
      .subscribe({
        next: () => {
          this.nuevoMensajeChat = '';
          this.cargarTickets(); // Esto refrescará el ticket y sus mensajes
        },
        error: (err) => {
          console.error('Error al enviar mensaje', err);
          this.mostrarToast('No se pudo enviar el mensaje', 'danger');
        }
      });
  }

  // --- Lógica de creación (Mantenida) ---

  crearTicket(modal: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = {
      titulo: this.nuevoTitulo,
      descripcion: this.nuevaDescripcion
    };

    this.http.post('http://localhost:8080/api/tickets/nuevo', body, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('Ticket creado correctamente', 'success');
          this.cargarTickets();
          this.nuevoTitulo = '';
          this.nuevaDescripcion = '';
          modal.dismiss();
        },
        error: (err) => console.error('Error al crear ticket', err)
      });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
