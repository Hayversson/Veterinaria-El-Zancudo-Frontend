import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

const apiUrl = 'http://localhost:8000/usuarios';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  admins: any[] = [];
  animalesUsuario: any[] = [];

  // Buscadores
  idBusqueda: string = '';
  idUsuarioAnimales: string = '';

  // Formularios
  nuevoUsuario = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    es_admin: false,
    password: ''
  };

  usuarioForm = {
    id_usuario: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    es_admin: false,
    password: ''
  };

  @ViewChild('crearUsuarioModal') crearUsuarioModal!: ElementRef;
  @ViewChild('editarUsuarioModal') editarUsuarioModal!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  // ---------------------------
  // GET PRINCIPAL (lista)
  // ---------------------------
  obtenerUsuarios() {
    this.http.get<any[]>(`${apiUrl}?skip=0&limit=50`).subscribe({
      next: res => this.usuarios = res,
      error: () => alert('Error al cargar usuarios')
    });
  }

  // ---------------------------
  // Buscar usuario por ID
  // ---------------------------
  buscarUsuarioPorId() {
    if (!this.idBusqueda.trim()) return;

    this.http.get<any>(`${apiUrl}/${this.idBusqueda}`).subscribe({
      next: res => this.usuarios = [res],
      error: () => alert('Usuario no encontrado')
    });
  }

  // ---------------------------
  // Obtener animales por usuario
  // ---------------------------
  obtenerAnimalesUsuario() {
    if (!this.idUsuarioAnimales.trim()) return;

    this.http.get<any[]>(`${apiUrl}/${this.idUsuarioAnimales}/animales`).subscribe({
      next: res => this.animalesUsuario = res,
      error: () => alert('No se pudieron obtener los animales del usuario')
    });
  }

  // ---------------------------
  // Obtener admins
  // ---------------------------
  obtenerAdmins() {
    this.http.get<any[]>(`${apiUrl}/admin/lista`).subscribe({
      next: res => this.admins = res,
      error: () => alert('Error al obtener administradores')
    });
  }

  // ---------------------------
  // Crear usuario
  // ---------------------------
  crearUsuario() {
    this.http.post<any>(apiUrl, this.nuevoUsuario).subscribe({
      next: res => {
        this.obtenerUsuarios();
        this.cerrarModal();
        this.nuevoUsuario = { nombre:'', apellido:'', email:'', telefono:'', es_admin:false, password:'' };
      },
      error: () => alert('Error al crear usuario')
    });
  }

  // ---------------------------
  // Abrir modal editar
  // ---------------------------
  editarUsuario(u: any) {
    this.usuarioForm = {
      id_usuario: u.id_usuario,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      es_admin: u.es_admin,
      password: ''
    };

    (this.editarUsuarioModal.nativeElement as HTMLElement).classList.add('show');
    (this.editarUsuarioModal.nativeElement as HTMLElement).style.display = 'block';
  }

  // ---------------------------
  // Guardar cambios
  // ---------------------------
  guardarCambios() {
    const url = `${apiUrl}/${this.usuarioForm.id_usuario}`;

    const payload = {
      nombre: this.usuarioForm.nombre,
      apellido: this.usuarioForm.apellido,
      email: this.usuarioForm.email,
      telefono: this.usuarioForm.telefono,
      es_admin: this.usuarioForm.es_admin,
      password: this.usuarioForm.password
    };

    this.http.put<any>(url, payload).subscribe({
      next: () => {
        this.obtenerUsuarios();
        this.cerrarModal();
      },
      error: () => alert('Error al actualizar usuario')
    });
  }

  // ---------------------------
  // Eliminar usuario
  // ---------------------------
  eliminarUsuario(id: string) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar'
    }).then(result => {
      if (result.isConfirmed) {

        this.http.delete(`${apiUrl}/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
            this.obtenerUsuarios();
          },
          error: () => alert('Error al eliminar usuario')
        });

      }
    });
  }

  // ---------------------------
  // Cerrar modal
  // ---------------------------
  cerrarModal() {
    (this.crearUsuarioModal?.nativeElement as HTMLElement).classList.remove('show');
    (this.crearUsuarioModal?.nativeElement as HTMLElement).style.display = 'none';

    (this.editarUsuarioModal?.nativeElement as HTMLElement).classList.remove('show');
    (this.editarUsuarioModal?.nativeElement as HTMLElement).style.display = 'none';
  }
}
