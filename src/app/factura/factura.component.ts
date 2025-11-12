import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

// Asumimos que la ruta en tu API para las facturas es /facturas
const apiUrl = environment.apiUrl + '/facturas';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent implements OnInit {

  facturas: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.obtenerFacturas();
  }

  /**
   * Obtiene todas las facturas desde la API
   */
  obtenerFacturas(): void {
  this.loading = true;
  this.error = null;

  this.http.get<any[]>(apiUrl).subscribe({
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

}