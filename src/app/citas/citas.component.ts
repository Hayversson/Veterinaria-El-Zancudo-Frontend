import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl + '/citas';
declare const bootstrap: any;

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss']
})
export class CitasComponent implements OnInit {

  citas: any[] = [];
  loading = false;
  error: string | null = null;

  // FORM CREAR
  nuevaCita = {
    id_servicio: '',
    id_animal: '',
    fecha_atencion: '',
    id_usuario_crea: ''
  };

  // FORM EDITAR
  citaForm: any = {
    id_citas: '',
    id_servicio: '',
    id_animal: '',
    fecha_atencion: ''
  };

  @ViewChild('crearCitaModal') crearCitaModal!: ElementRef;
  @ViewChild('editarCitaModal') editarCitaModal!: ElementRef;

  modalCrearInstance: any;
  modalEditarInstance: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerCitas();
  }

  ngAfterViewInit() {
    this.modalCrearInstance = new bootstrap.Modal(this.crearCitaModal.nativeElement);
    this.modalEditarInstance = new bootstrap.Modal(this.editarCitaModal.nativeElement);
  }

  obtenerCitas() {
    this.loading = true;

    this.http.get<any[]>(apiUrl).subscribe({
      next: res => { this.citas = res; this.loading = false; },
      error: () => { this.error = 'No se pudieron cargar las citas'; this.loading = false; }
    });
  }

  abrirModalCrear() {
    this.modalCrearInstance.show();
  }

  cerrarModal() {
    if (this.modalCrearInstance) this.modalCrearInstance.hide();
    if (this.modalEditarInstance) this.modalEditarInstance.hide();
  }

  crearCita() {
  const payload = {
    id_servicio: this.nuevaCita.id_servicio,
    id_animal: this.nuevaCita.id_animal,
    fecha_atencion: new Date(this.nuevaCita.fecha_atencion).toISOString(),
    id_usuario_crea: this.nuevaCita.id_usuario_crea
  };

  this.http.post<any>(apiUrl, payload).subscribe({
    next: (res) => {
      this.citas.push(res);
      this.cerrarModal();

      // Reiniciar formulario
      this.nuevaCita = { 
        id_servicio: '', 
        id_animal: '', 
        fecha_atencion: '', 
        id_usuario_crea: '' 
      };
    },
    error: () => alert('Error al crear la cita')
  });
}


  eliminarCita(id: string) {
    if (!confirm('¿Eliminar cita?')) return;

    this.http.delete<any>(`${apiUrl}/${id}`).subscribe({
      next: r => { alert('Cita eliminada'); this.obtenerCitas(); },
      error: e => alert('Error al eliminar')
    });
  }

  editarCita(c: any) {
  this.citaForm = {
    id_citas: c.id_citas,           // ID de la cita que estás editando
    id_servicio: c.id_servicio,
    id_animal: c.id_animal,
    fecha_atencion: c.fecha_atencion,
    id_usuario_edita: ''            // Se llenará manualmente desde el modal
  };

  this.modalEditarInstance.show();
}


  guardarCambios() {
  const url = `${apiUrl}/${this.citaForm.id_citas}`;

  const payload = {
    id_servicio: this.citaForm.id_servicio,
    id_animal: this.citaForm.id_animal,
    fecha_atencion: this.citaForm.fecha_atencion,
    id_usuario_edita: this.citaForm.id_usuario_edita
  };

  this.http.put<any>(url, payload).subscribe({
    next: res => {
      alert('Cita actualizada');
      this.obtenerCitas();
      this.cerrarModal();
    },
    error: () => alert('Error al actualizar cita')
  });
}


  buscarCitasPorAnimal(id_animal: string) {
    if (!id_animal) return alert('Ingresa un ID de animal');

    this.http.get<any[]>(`${apiUrl}/animal/${id_animal}`).subscribe({
      next: res => this.citas = res,
      error: () => alert('Error al buscar citas')
    });
  }
}
