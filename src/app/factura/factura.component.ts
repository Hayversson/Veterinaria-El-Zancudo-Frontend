import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

// Asumimos que la ruta en tu API para las facturas es /facturas
const apiUrl = environment.apiUrl + '/facturas';

/**
 * Interfaz que representa la estructura de un objeto Factura.
 */
interface Factura {
  id_factura: string;
  id_cita: string;
  id_usuario_pago: string;
  costo: number | string; // Puede ser número o string según el contexto del form
  fecha_generacion: string;
  fecha_pago?: string | null; // Hacer opcional
  pagada: boolean;
  id_usuario_edita?: string; // Añadir para el formulario de edición
}


@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent implements OnInit {
  facturas: Factura[] = [];
  loading = false;
  error: string | null = null;
  facturaSeleccionada: Factura | null = null;
  mostrarModalEditar = false;
  mostrarModalCrear = false;
  nuevoFactura: { id_cita: string; costo: string; id_usuario_pago: string; } = {
    id_cita: '',
    costo: '',
    id_usuario_pago: ''
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.obtenerFacturas();
  }

  /**
   * Obtiene todas las facturas desde la API
   */
  public obtenerFacturas(): void {
    this.loading = true;
    this.error = null;
    this.http.get<Factura[]>(apiUrl).subscribe({
      next: (response) => {
        this.facturas = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener las facturas:', error);
        this.error = 'No se pudieron cargar las facturas. Inténtalo más tarde.';
        this.loading = false;
      }
    });
  }

  /**
   * Busca una factura específica por su ID.
   * @param id El ID de la factura a buscar.
   */
  public buscarFacturaPorId(id: string): void {
    // Si el campo de búsqueda está vacío, volvemos a cargar todas las facturas.
    if (!id) {
      this.obtenerFacturas();
      return;
    }

    this.loading = true;
    this.error = null;
    this.http.get<Factura>(`${apiUrl}/${id}`).subscribe({
      next: (response) => {
        // La API devuelve un solo objeto, lo ponemos en un array para que la tabla funcione.
        this.facturas = [response];
        this.loading = false;
      },
      error: (error) => {
        console.error(`Error al buscar la factura con ID ${id}:`, error);
        this.error = `No se pudo encontrar la factura con ID "${id}". Verifica el ID e inténtalo de nuevo.`;
        this.facturas = []; // Limpiamos la tabla si hay un error
        this.loading = false;
      }
    });
  }

  /**
   * Crea una nueva factura en la API.
   * @param nuevaFactura El objeto de la factura a crear.
   */
  public crearFactura(nuevaFactura: { id_cita: string; costo: string; id_usuario_pago: string; }): void {
    this.loading = true;
    this.error = null;
    
    // Nota: Los campos como id_factura, fechas y pagada suelen ser generados por el backend.
    // El frontend solo envía los datos necesarios para la creación.
    this.http.post<any>(apiUrl, nuevaFactura).subscribe({
      next: (facturaCreada) => {
        console.log('Factura creada exitosamente:', facturaCreada);
        // Después de crear, refrescamos la lista para ver la nueva factura.
        this.cerrarModalCrear();
        this.obtenerFacturas();
      },
      error: (error) => {
        console.error('Error al crear la factura:', error);
        this.error = 'No se pudo crear la factura. Revisa los datos e inténtalo más tarde.';
        this.loading = false;
      }
    });
  }

  /**
   * Actualiza una factura existente en la API.
   * @param facturaActualizada El objeto completo de la factura a actualizar.
   */
  public actualizarFactura(facturaActualizada: Factura): void {
    this.loading = true;
    this.error = null;

    // Construir la URL con el parámetro requerido por la API, como en animales.component.ts
    const url = `${apiUrl}/${facturaActualizada.id_factura}?id_usuario_edita=${facturaActualizada.id_usuario_edita}`;

    // El payload no debe incluir los IDs que van en la URL
    const payload = {
      costo: facturaActualizada.costo,
      pagada: facturaActualizada.pagada,
      fecha_pago: facturaActualizada.fecha_pago
    };

    this.http.put<any>(url, payload).subscribe({
      next: (response) => {
        console.log('Factura actualizada exitosamente:', response);
        this.cerrarModalEditar(); // <-- Se mueve aquí
        this.obtenerFacturas(); // Recargamos la lista para ver los cambios.
      },
      error: (httpError) => {
        console.error('Error al actualizar la factura:', httpError);
        // Intenta obtener un mensaje de error específico de la respuesta de la API
        const mensajeError = httpError.error?.mensaje || httpError.message || 'Ocurrió un error desconocido. Revisa la consola del navegador para más detalles.';
        this.error = `No se pudo actualizar la factura: ${mensajeError}`;
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal de edición con los datos de la factura seleccionada.
   * @param factura La factura a editar.
   */
  public abrirModalEditar(factura: Factura): void {
    // Creamos una copia del objeto para no modificar la tabla directamente.
    this.facturaSeleccionada = { 
      ...factura,
      id_usuario_edita: '' // Inicializar el campo para el usuario que edita
    };
    this.mostrarModalEditar = true;
  }

  /**
   * Cierra el modal de edición.
   */
  public cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.facturaSeleccionada = null;
  }

  /**
   * Elimina una factura por su ID, con confirmación previa.
   * @param idFactura El ID de la factura a eliminar.
   */
  public eliminarFactura(idFactura: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.http.delete<{ exito: boolean; mensaje: string; datos: any }>(`${apiUrl}/${idFactura}`).subscribe({
      next: (response) => {
        if (response && response.exito) {
          alert(response.mensaje || 'Factura eliminada correctamente.');
          this.obtenerFacturas(); // Recarga la lista para reflejar el cambio.
        } else {
          this.error = response.mensaje || 'No se pudo eliminar la factura.';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al eliminar la factura:', error);
        this.error = 'Ocurrió un error en la comunicación al intentar eliminar la factura.';
        this.loading = false;
      }
    });
  }

  /**
   * Marca una factura como pagada.
   * @param factura La factura a pagar.
   */
  public pagarFactura(factura: Factura): void {
    const idUsuarioQuePaga = prompt('Por favor, ingresa el ID del usuario que realiza el pago:');
    if (!idUsuarioQuePaga) {
      alert('El ID del usuario es requerido para realizar el pago.');
      return;
    }

    this.loading = true;
    this.error = null;

    const url = `${apiUrl}/${factura.id_factura}?id_usuario_edita=${idUsuarioQuePaga}`;
    const payload = {
      costo: factura.costo,
      pagada: true,
      fecha_pago: new Date().toISOString() // Establece la fecha de pago a la actual
    };

    this.http.put<any>(url, payload).subscribe({
      next: (response) => {
        console.log('Factura pagada exitosamente:', response);
        alert('Factura marcada como pagada.');
        this.obtenerFacturas();
      },
      error: (httpError) => {
        console.error('Error al pagar la factura:', httpError);
        const mensajeError = httpError.error?.mensaje || httpError.message || 'Ocurrió un error desconocido.';
        this.error = `No se pudo pagar la factura: ${mensajeError}`;
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal para crear una nueva factura.
   */
  public abrirModalCrear(): void {
    this.nuevoFactura = {
      id_cita: '',
      costo: '',
      id_usuario_pago: ''
    };
    this.mostrarModalCrear = true;
  }

  /**
   * Cierra el modal de creación.
   */
  public cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
  }
}
