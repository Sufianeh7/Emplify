import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';
import { addIcons } from 'ionicons';
import {
  checkmarkDoneOutline, timeOutline, sendOutline,
  closeOutline, checkmarkCircleOutline, chevronForwardOutline
} from 'ionicons/icons';

// WebSockets
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-soporte-tickets',
  templateUrl: './soporte-tickets.page.html',
  styleUrls: ['./soporte-tickets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent],
})
export class SoporteTicketsPage implements OnDestroy {

  @ViewChild('contentChat') contentChat: any;

  tickets: any[] = [];
  filtroActual: string = 'abiertos';

  // Control del chat
  ticketSeleccionado: any = null;
  isChatOpen = false;
  mensajesChat: any[] = [];
  nuevoMensaje: string = '';

  idRRHH: number = 0;
  private stompClient: Client | null = null;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      checkmarkDoneOutline, timeOutline, sendOutline,
      closeOutline, checkmarkCircleOutline, chevronForwardOutline
    });
  }

  // Refresca la lista de tickets globales al entrar a la vista
  ionViewWillEnter() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      this.idRRHH = empleado.idEmpleado;
    }
    this.cargarTickets();
  }

  // Limpia el socket de conexión para no consumir memoria en segundo plano
  ngOnDestroy() {
    this.desconectarWebSocket();
  }

  // --- 1. LÓGICA DE LISTADOS ---
  cargarTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http.get(environment.apiUrl+'/tickets/todos', { headers })
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

  // Getter inteligente para los segmentos
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

  // --- 2. LÓGICA DEL CHAT EN TIEMPO REAL ---
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
    this.cargarTickets(); // Refrescar lista al salir por si ha habido cambios de estado
  }

  conectarWebSocket(idTicket: number) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.apiUrl+'/ws-endpoint'),
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
    if (!this.nuevoMensaje.trim() || !this.ticketSeleccionado?.idTicket) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    const body = { contenido: this.nuevoMensaje };

    this.http.post(environment.apiUrl+`/tickets/${this.ticketSeleccionado.idTicket}/enviar-mensaje`, body, { headers })
      .subscribe({
        next: () => {
          this.nuevoMensaje = ''; // El mensaje volverá a través del WebSocket y se pintará
        },
        error: (err) => console.error('Error enviando mensaje de RRHH', err)
      });
  }

  // --- 3. CAMBIOS DE ESTADO ---
  async resolverTicket(idTicket: number) {
    if(!idTicket) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token, 'Content-Type': 'application/json' });
    const body = { estado: 'RESUELTO' };

    this.http.put(environment.apiUrl+`/tickets/${idTicket}/responder`, body, { headers })
      .subscribe({
        next: () => {
          this.mostrarToast('¡Ticket resuelto con éxito!', 'success');
          this.ticketSeleccionado.estado = 'RESUELTO'; // Actualización instantánea UI
          this.cargarTickets(); // Sincronización en segundo plano
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
}
