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
  loading: boolean = false;
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
      next: (data) => {
        this.facturas = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar las facturas. Verifica la conexión con la API.';
        this.loading = false;
      }
    });
  }
}