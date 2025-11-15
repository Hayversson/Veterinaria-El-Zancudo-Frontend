import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

const apiUrl = 'http://localhost:8000/usuarios';
const apiUrlAnimales = 'http://localhost:8000/animales';

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
      next: res => {
        this.usuarios = [res];
        window.scrollTo(0, 0);
      },
      error: () => alert('Usuario no encontrado')
    });
  }

  // ---------------------------
  // Limpiar búsqueda y recargar lista
  // ---------------------------
  limpiarBusqueda() {
    this.idBusqueda = '';
    this.obtenerUsuarios();
    window.scrollTo(0, 0);
  }

  // ---------------------------
  // Obtener animales por usuario
  // ---------------------------
  obtenerAnimalesUsuario() {
    if (!this.idUsuarioAnimales.trim()) return;

    this.http.get<any[]>(`${apiUrlAnimales}/propietario/${this.idUsuarioAnimales}`).subscribe({
      next: res => {
        this.animalesUsuario = res;
        if (res.length === 0) {
          alert('Este usuario no tiene animales registrados');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al obtener los animales. Verifica que el ID sea correcto.');
      }
    });
  }

  // ---------------------------
  // Obtener admins
  // ---------------------------
  obtenerAdmins() {
    this.http.get<any[]>(`${apiUrl}/admin/lista`).subscribe({
      next: res => {
        this.admins = res;
        if (res.length === 0) {
          alert('No hay administradores registrados');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al obtener administradores. Verifica la conexión con la API.');
      }
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
  // Cambiar contraseña de usuario
  // ---------------------------
  cambiarContrasena(idUsuario: string) {
    Swal.fire({
      title: 'Cambiar Contraseña',
      html: `
        <input type="password" id="nuevaContraseña" class="swal2-input" placeholder="Nueva contraseña" required>
        <input type="password" id="confirmarContraseña" class="swal2-input" placeholder="Confirmar contraseña" required>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Cambiar',
      preConfirm: () => {
        const nuevaContraseña = (document.getElementById('nuevaContraseña') as HTMLInputElement).value;
        const confirmarContraseña = (document.getElementById('confirmarContraseña') as HTMLInputElement).value;

        if (!nuevaContraseña || !confirmarContraseña) {
          Swal.showValidationMessage('Ambos campos son requeridos');
          return null;
        }

        if (nuevaContraseña !== confirmarContraseña) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return null;
        }

        if (nuevaContraseña.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return null;
        }

        return nuevaContraseña;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const payload = {
          password: result.value
        };

        // Intenta primero con PUT directo al usuario
        this.http.put<any>(`${apiUrl}/${idUsuario}`, payload).subscribe({
          next: (response) => {
            if (response.exito) {
              Swal.fire('Éxito', response.mensaje || 'Contraseña cambiada correctamente', 'success');
            } else {
              Swal.fire('Error', response.mensaje || 'No se pudo cambiar la contraseña', 'error');
            }
          },
          error: (err) => {
            console.error('Error completo:', err);
            const mensajeError = err.error?.mensaje || err.message || 'Verifica la ruta en el backend. Intenta PUT /usuarios/{id} o POST /usuarios/{id}/cambiar-password';
            Swal.fire('Error', mensajeError, 'error');
          }
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
