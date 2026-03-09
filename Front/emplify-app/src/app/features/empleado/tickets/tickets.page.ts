import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { addIcons } from 'ionicons';
import {
  addOutline, chatbubblesOutline, closeOutline, sendOutline,
  homeOutline, calendarOutline, menuOutline, chevronForwardOutline,
  alertCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/componentes/header/header.component';

// Librerías WebSocket
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class TicketsPage implements OnInit, OnDestroy {

  @ViewChild('contentChat') contentChat: any;

  tickets: any[] = [];
  filtroActual: string = 'abiertos';

  // Variables para CREAR ticket
  nuevoTitulo: string = '';
  nuevaDescripcion: string = '';

  // Variables para el CHAT
  ticketSeleccionado: any = null;
  isChatOpen = false;
  mensajesChat: any[] = [];
  nuevoMensaje: string = '';

  idEmpleado: number = 0;

  // Cliente WebSocket
  private stompClient: Client | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline, chatbubblesOutline, closeOutline, sendOutline,
      homeOutline, calendarOutline, menuOutline, chevronForwardOutline,
      alertCircleOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    const datos = localStorage.getItem('empleadoLogueado');
    if (datos) {
      const empleado = JSON.parse(datos);
      this.idEmpleado = empleado.idEmpleado;
    }
  }

  ionViewWillEnter() {
    this.cargarTickets();
  }

  ngOnDestroy() {
    this.desconectarWebSocket();
  }

  // --- 1. CARGA DE TICKETS ---
  cargarTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ 'Authorization': 'Basic ' + token });

    this.http.get(`http://localhost:8080/api/tickets/mis-tickets`, { headers })
      .subscribe({
        next: (res: any) => this.tickets = res,
        error: (err) => console.error('Error cargando tickets', err)
      });
  }

  // NUEVA FUNCIÓN: Comprueba si un ticket está cerrado o resuelto
  esTicketCerrado(estado: string): boolean {
    if (!estado) return false;
    const est = estado.toUpperCase();
    return est === 'CERRADO' || est === 'RESUELTO';
  }

  // ACTUALIZADO PARA USAR LA NUEVA FUNCIÓN
  get ticketsFiltrados() {
    if (this.filtroActual === 'abiertos') {
      return this.tickets.filter(t => !this.esTicketCerrado(t.estado));
    } else {
      return this.tickets.filter(t => this.esTicketCerrado(t.estado));
    }
  }

  // --- 2. CREACIÓN DE TICKETS ---
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

  // --- 3. LÓGICA DEL CHAT Y WEBSOCKETS ---
  abrirChat(ticket: any) {
    this.ticketSeleccionado = ticket;
    this.isChatOpen = true;

    // Cargar historial
    this.mensajesChat = ticket.mensajes || [];

    this.conectarWebSocket(ticket.idTicket);
    setTimeout(() => this.scrollToBottom(), 300);
  }

  cerrarChat() {
    this.isChatOpen = false;
    this.ticketSeleccionado = null;
    this.desconectarWebSocket();
    this.cargarTickets(); // Recargamos para actualizar la vista previa en la lista
  }

  conectarWebSocket(idTicket: number) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-endpoint'),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Conectado al Ticket: ' + idTicket);
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

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + token,
      'Content-Type': 'application/json'
    });

    const body = { contenido: this.nuevoMensaje };

    this.http.post(`http://localhost:8080/api/tickets/${this.ticketSeleccionado.idTicket}/enviar-mensaje`, body, { headers })
      .subscribe({
        next: () => {
          this.nuevoMensaje = ''; // El mensaje llegará por WebSocket
        },
        error: (err) => console.error('Error enviando', err)
      });
  }

  scrollToBottom() {
    if (this.contentChat) {
      this.contentChat.scrollToBottom(300);
    }
  }

  goTo(ruta: string) {
    this.router.navigate([ruta]);
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
