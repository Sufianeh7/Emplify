import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

// Iconos
import { addIcons } from 'ionicons';
import {
  checkmarkDoneOutline, briefcaseOutline, timeOutline, alertCircleOutline,
  arrowBackOutline, sendOutline, closeOutline, chatbubblesOutline,
  homeOutline, calendarOutline, menuOutline, checkmarkCircleOutline,
  chevronForwardOutline
} from 'ionicons/icons';

// Librerías WebSocket
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-soporte-tickets',
  templateUrl: './soporte-tickets.page.html',
  styleUrls: ['./soporte-tickets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent],
})
export class SoporteTicketsPage implements OnInit, OnDestroy {

  @ViewChild('contentChat') contentChat: any;

  tickets: any[] = [];
  filtroActual: string = 'abiertos';

  // Variables Chat
  ticketSeleccionado: any = null;
  isChatOpen = false;
  mensajesChat: any[] = [];
  nuevoMensaje: string = '';

  idRRHH: number = 0;

  // Cliente WebSocket
  private stompClient: Client | null = null;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({
      checkmarkDoneOutline, briefcaseOutline, timeOutline, alertCircleOutline,
      arrowBackOutline, sendOutline, closeOutline, chatbubblesOutline,
      homeOutline, calendarOutline, menuOutline, checkmarkCircleOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      this.idRRHH = empleado.idEmpleado;
    }
  }

  ionViewWillEnter() {
    this.cargarTickets();
  }

  ngOnDestroy() {
    this.desconectarWebSocket();
  }

  // --- LÓGICA DE TICKETS ---

  cargarTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http.get('http://localhost:8080/api/tickets/todos', { headers })
      .subscribe({
        next: (res: any) => this.tickets = res,
        error: (err) => {
          console.error('Error al cargar tickets globales', err);
          this.mostrarToast('Error al obtener los tickets', 'danger');
        },
      });
  }

  esTicketCerrado(estado: string): boolean {
    if (!estado) return false;
    const est = estado.toUpperCase();
    return est === 'CERRADO' || est === 'RESUELTO';
  }

  get ticketsFiltrados() {
    if (this.filtroActual === 'abiertos') {
      return this.tickets.filter(t => !this.esTicketCerrado(t.estado));
    } else {
      return this.tickets.filter(t => this.esTicketCerrado(t.estado));
    }
  }

  getInicial(nombre: string): string {
    if (!nombre) return '?';
    return nombre.charAt(0).toUpperCase();
  }

  // --- LÓGICA DE CHAT Y WEBSOCKETS ---

  abrirChat(ticket: any) {
    this.ticketSeleccionado = ticket;
    this.mensajesChat = ticket.mensajes || [];
    this.isChatOpen = true;

    this.conectarWebSocket(ticket.idTicket);
    setTimeout(() => this.scrollToBottom(), 300);
  }

  cerrarChat() {
    this.isChatOpen = false;
    this.ticketSeleccionado = null;
    this.desconectarWebSocket();
    this.cargarTickets(); // Refrescar lista al salir
  }

  conectarWebSocket(idTicket: number) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-endpoint'),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
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
    }
  }

  enviarRespuesta() {
    if (!this.nuevoMensaje.trim()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    const body = { contenido: this.nuevoMensaje };

    this.http.post(`http://localhost:8080/api/tickets/${this.ticketSeleccionado.idTicket}/enviar-mensaje`, body, { headers })
      .subscribe({
        next: () => {
          this.nuevoMensaje = ''; // Se limpia, el mensaje vuelve por WebSocket
        },
        error: (err) => console.error('Error enviando mensaje', err)
      });
  }

  async resolverTicket(idTicket: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token, 'Content-Type': 'application/json' });
    const body = { estado: 'RESUELTO' };

    this.http.put(`http://localhost:8080/api/tickets/${idTicket}/responder`, body, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('¡Ticket resuelto con éxito!', 'success');
          this.ticketSeleccionado.estado = 'RESUELTO'; // Actualizamos UI al instante
          this.cargarTickets();
        },
        error: () => this.mostrarToast('No se pudo actualizar el ticket', 'danger'),
      });
  }

  scrollToBottom() {
    if (this.contentChat) {
      this.contentChat.scrollToBottom(300);
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  goTo(ruta: string) {
    this.router.navigate([ruta]);
  }
}
