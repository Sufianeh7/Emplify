import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  checkmarkDoneOutline,
  briefcaseOutline,
  timeOutline,
  alertCircleOutline,
  arrowBackOutline,
  arrowBack,
  send,
  close,
} from 'ionicons/icons';

import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-rrhh',
  templateUrl: './gestion-rrhh.page.html',
  styleUrls: ['./gestion-rrhh.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GestionRRHHPage implements OnInit {
  nuevoMensaje: string = '';
  ticketSeleccionado: any = null;

  // Array para almacenar todos los tickets de la empresa
  tickets: any[] = [];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {
    // Añadimos los iconos necesarios para la interfaz
    addIcons({
      checkmarkDoneOutline,
      briefcaseOutline,
      timeOutline,
      alertCircleOutline,
      arrowBackOutline,
      arrowBack,
      send,
      close
    });
  }

  ngOnInit() {
    this.cargarTickets();
  }

  // Se ejecuta cada vez que entramos a la vista para asegurar datos frescos
  ionViewWillEnter() {
    this.cargarTickets();
  }

  // Función para obtener la lista global de tickets
  cargarTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    // Llamamos al endpoint /api/tickets/todos que definimos en el controlador
    this.http
      .get('http://localhost:8080/api/tickets/todos', { headers })
      .subscribe({
        next: (res: any) => {
          this.tickets = res;
          console.log('Tickets cargados para RRHH:', res);
        },
        error: (err) => {
          console.error('Error al cargar tickets globales', err);
          this.mostrarToast('Error al obtener los tickets', 'danger');
        },
      });
  }

  // Función para cambiar el estado de un ticket a RESUELTO
  async resolverTicket(idTicket: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    // Enviamos el Map<String, String> que espera tu @PutMapping("/{id}/responder")
    const body = { estado: 'RESUELTO' };

    this.http
      .put(`http://localhost:8080/api/tickets/${idTicket}/responder`, body, {
        headers,
      })
      .subscribe({
        next: () => {
          this.mostrarToast('¡Ticket marcado como resuelto!', 'success');
          this.cargarTickets(); // Recargamos la lista para ver el cambio de Badge
        },
        error: (err) => {
          console.error('Error al resolver ticket', err);
          this.mostrarToast('No se pudo actualizar el ticket', 'danger');
        },
      });
  }

  seleccionarTicket(ticket: any) {
    this.ticketSeleccionado = ticket;
  }

  enviarRespuesta() {
    if (!this.nuevoMensaje.trim()) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token,
      'Content-Type': 'application/json',
    });

    const body = { contenido: this.nuevoMensaje };

    this.http
      .post(
        `http://localhost:8080/api/tickets/${this.ticketSeleccionado.idTicket}/enviar-mensaje`,
        body,
        { headers },
      )
      .subscribe({
        next: () => {
          this.nuevoMensaje = '';
          this.refrescarTicket(); // Recargamos para ver el mensaje
          this.mostrarToast('Mensaje enviado', 'success');
        },
      });
  }

  // Recarga el ticket actual para ver los nuevos mensajes del chat
  refrescarTicket() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    this.http
      .get(`http://localhost:8080/api/tickets/todos`, { headers })
      .subscribe((res: any) => {
        this.tickets = res;
        // Actualizamos la referencia del seleccionado
        this.ticketSeleccionado = this.tickets.find(
          (t) => t.idTicket === this.ticketSeleccionado.idTicket,
        );
      });
  }

  // Utilidad para mensajes visuales
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  goInicio(){
    if(document.activeElement) (document.activeElement as HTMLElement).blur();
    this.router.navigate(['inicio'])
  }
}
