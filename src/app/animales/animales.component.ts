import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
const apiUrl = environment.apiUrl + '/animales';
declare const bootstrap: any;

@Component({
  selector: 'app-animales',
  templateUrl: './animales.component.html',
  styleUrls: ['./animales.component.scss']
})
export class AnimalesComponent implements OnInit {

  animales: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  //para razas
  razas: any[] = [];
  razasMap: { [id: string]: string } = {};

  // Formulario del nuevo animal
  nuevoAnimal = {
    nombre_animal: '',
    edad_animal: '',
    id_genero: '',
    id_raza: '',
    id_usuario: '',
    id_usuario_crea: ''
  };

  // Referencias a los modales
  @ViewChild('crearAnimalModal') crearAnimalModal!: ElementRef;
  @ViewChild('editarAnimalModal') editarAnimalModal!: ElementRef;

  modalCrearInstance: any;
  modalEditarInstance: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerAnimales();
    this.cargarRazas(); // si ya lo tienes, aquí mapeas las razas
  }

  ngAfterViewInit(): void {
    // Inicializar ambos modales de Bootstrap
    this.modalCrearInstance = new bootstrap.Modal(this.crearAnimalModal.nativeElement);
    this.modalEditarInstance = new bootstrap.Modal(this.editarAnimalModal.nativeElement);
  }

  /** -------------------------
   *  CRUD BÁSICO
   * ------------------------- */
  cargarRazas(): void {
    const urlCandidates = [
      `${environment.apiUrl}/razas-animal`
    ];
 
    // Intentamos varias rutas comunes hasta que una responda
    const tryNext = (index: number) => {
      if (index >= urlCandidates.length) return;
      const url = urlCandidates[index];
      this.http.get<any[]>(url).subscribe({
        next: (data) => {
          // Normalizar estructura: buscar campos evidentes
          this.razas = data || [];
          this.razasMap = {};
          this.razas.forEach(r => {
            const id = r.id_raza || r.id || r._id || r.id_raza_animal;
            const nombre = r.nombre_raza || r.nombre || r.nombreRaza || r.raza || '';
            if (id) this.razasMap[id] = nombre || id;
          });
        },
        error: () => {
          // Intentar siguiente URL
          tryNext(index + 1);
        }
      });
    };
 
    tryNext(0);
  }
 
 

  obtenerAnimales(): void {
    this.loading = true;
    this.error = null;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.animales = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los animales. Verifica la conexión con la API.';
        this.loading = false;
      }
    });
  }

  /** Modal Crear Animal */
  abrirModal(): void {
    this.modalCrearInstance.show();
  }

  /** Cerrar cualquier modal */
  cerrarModal(): void {
    if (this.modalCrearInstance) this.modalCrearInstance.hide();
    if (this.modalEditarInstance) this.modalEditarInstance.hide();
  }

  /** Crear Animal */
  crearAnimal(): void {
    this.http.post<any>(apiUrl, this.nuevoAnimal).subscribe({
      next: (res) => {
        this.animales.push(res);
        this.cerrarModal();
        this.nuevoAnimal = {
          nombre_animal: '',
          edad_animal: '',
          id_genero: '',
          id_raza: '',
          id_usuario: '',
          id_usuario_crea: ''
        };
      },
      error: () => {
        alert('Error al crear el animal.');
      }
    });
  }

  /** Eliminar Animal */
  eliminarAnimal(id_animal: string): void {
    if (!confirm('¿Seguro que deseas eliminar este animal?')) return;

    const url = `${apiUrl}/${id_animal}`;
    console.log('🗑️ Eliminando animal con ID:', id_animal);

    this.http.delete<any>(url).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);

        if (response.exito) {
          alert(`Animal eliminado correctamente.`);
          this.obtenerAnimales();
        } else {
          alert(`No se pudo eliminar el animal: ${response.mensaje}`);
        }
      },
      error: (err) => {
        console.error('❌ Error al eliminar el animal:', err);
        alert('Error al eliminar el animal. Verifica la conexión con la API.');
      }
    });
  }
  
  /*EN CONTRUCCIÓN */
  /** -------------------------
   *  EDICIÓN DE ANIMAL
   * ------------------------- */
  modoEdicion: boolean = false;
  animalForm: any = { 
    nombre_animal:'', 
    edad_animal:'', 
    id_genero:'', 
    id_raza:'', 
    id_usuario:'', 
    id_usuario_edita:'', 
    id_animal:'' 
  };

  // Abrir modal de edición
  editarAnimal(animal: any): void {
    this.modoEdicion = true;
    this.animalForm = {
      nombre_animal: animal.nombre_animal,
      edad_animal: animal.edad_animal,
      id_genero: animal.id_genero,
      id_raza: animal.id_raza,
      id_usuario_edita: '', // usuario que edita se ingresa manualmente
      id_animal: animal.id_animal
    };
    this.modalEditarInstance.show();
  }
  // Guardar cambios del animal editado
  guardarCambios(): void {
    const url = `${apiUrl}/${this.animalForm.id_animal}?id_usuario_edita=${this.animalForm.id_usuario_edita}`; //la petición requería el query usuario que edita no en el body sino en la url, así lo diga en el request body
    const payload = {
      nombre_animal: this.animalForm.nombre_animal,
      edad_animal: this.animalForm.edad_animal,
      id_genero: this.animalForm.id_genero,
      id_raza: this.animalForm.id_raza
    };
    
      console.log('📦 Payload que se enviará:', payload); 

    this.http.put<any>(url, payload).subscribe({
      next: (response) => {
        if (response.exito) {
          alert('Animal actualizado correctamente.');
          this.obtenerAnimales();
          this.cerrarModal();
          this.modoEdicion = false;
        } else {
          alert(`No se pudo actualizar: ${response.mensaje}`);
        }
      },
      error: (err) => {
        console.error('Error al editar animal:', err);
        alert('Error al editar el animal.');
      }
    });
  }

   /*Buscar animales por ID de propietario*/
  buscarAnimalesPorPropietario(id_usuario: string): void {
    if (!id_usuario) {
      alert('Por favor, ingresa un ID de propietario.');
      return;
    }

    const url = `${apiUrl}/propietario/${id_usuario}`;
    this.loading = true;
    this.error = null;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.animales = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar animales por propietario:', err);
        this.error = 'No se pudieron obtener los animales del propietario.';
        this.loading = false;
      }
    });
  }



}

