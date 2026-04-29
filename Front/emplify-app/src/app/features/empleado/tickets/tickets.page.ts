import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  addOutline, chatbubblesOutline, closeOutline, sendOutline, chevronForwardOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

// WebSockets
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class TicketsPage implements OnDestroy {

  @ViewChild('contentChat') contentChat: any;

  tickets: any[] = [];
  filtroActual: string = 'abiertos';

  // Creación de Ticket
  nuevoTitulo: string = '';
  nuevaDescripcion: string = '';

  // Control del Chat
  ticketSeleccionado: any = null;
  isChatOpen = false;
  mensajesChat: any[] = [];
  nuevoMensaje: string = '';

  idEmpleado: number = 0;
  private stompClient: Client | null = null;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline, chatbubblesOutline, closeOutline, sendOutline, chevronForwardOutline
    });
  }

  // Refresca la vista siempre que entramos
  ionViewWillEnter() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      this.idEmpleado = empleado.idEmpleado;
    }
    this.cargarTickets();
  }

  // Al salir de la vista, destruimos el socket
  ngOnDestroy() {
    this.desconectarWebSocket();
  }

  // --- 1. LÓGICA DE TICKETS ---
  cargarTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(environment.apiUrl+`/tickets/mis-tickets`, { headers })
      .subscribe({
        next: (res: any) => this.tickets = res,
        error: (err) => console.error('Error cargando tickets', err)
      });
  }

  esTicketCerrado(estado: string): boolean {
    if (!estado) return false;
    const est = estado.toUpperCase();
    return est === 'CERRADO' || est === 'RESUELTO';
  }

  // Getter dinámico para los segmentos del HTML
  get ticketsFiltrados() {
    if (this.filtroActual === 'abiertos') {
      return this.tickets.filter(t => !this.esTicketCerrado(t.estado));
    } else {
      return this.tickets.filter(t => this.esTicketCerrado(t.estado));
    }
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
    };

    this.http.post(environment.apiUrl+'/tickets/nuevo', body, { headers })
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

  // --- 2. LÓGICA DEL CHAT Y WEBSOCKETS ---
  abrirChat(ticket: any) {
    this.ticketSeleccionado = ticket;
    this.isChatOpen = true;

    // Cargar historial previo de la BBDD
    this.mensajesChat = ticket.mensajes || [];

    // Conectar el socket y hacer scroll automático
    this.conectarWebSocket(ticket.idTicket);
    setTimeout(() => this.scrollToBottom(), 300);
  }

  cerrarChat() {
    this.isChatOpen = false;
    this.ticketSeleccionado = null;
    this.desconectarWebSocket();
    this.cargarTickets(); // Recargamos para actualizar estado en el listado
  }

  conectarWebSocket(idTicket: number) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.apiUrl+'/ws-endpoint'),
      reconnectDelay: 5000, // Reintento si se cae la red
    });

    this.stompClient.onConnect = () => {
      console.log('Conectado al canal del Ticket: ' + idTicket);

      this.stompClient?.subscribe(`/topic/ticket/${idTicket}`, (mensaje) => {
        const mensajeRecibido = JSON.parse(mensaje.body);
        this.mensajesChat.push(mensajeRecibido);
        this.scrollToBottom();
      });
    };

    this.stompClient.activate();
  }

  desconectarWebSocket() {
    if (this.stompClient !== null) {
      this.stompClient.deactivate();
      console.log('Desconectado del WebSocket');
    }
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = { contenido: this.nuevoMensaje };

    this.http.post(environment.apiUrl+`/tickets/${this.ticketSeleccionado.idTicket}/enviar-mensaje`, body, { headers })
      .subscribe({
        next: () => {
          this.nuevoMensaje = ''; // Limpiamos la caja. El mensaje se pintará cuando el WebSocket avise.
        },
        error: (err) => console.error('Error enviando mensaje', err)
      });
  }

  scrollToBottom() {
    if (this.contentChat) {
      this.contentChat.scrollToBottom(300);
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}
