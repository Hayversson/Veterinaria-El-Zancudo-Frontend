import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UsuariosComponent } from '../../usuarios/usuarios.component';
import { AnimalesComponent } from '../../animales/animales.component';
import { CitasComponent } from '../../citas/citas.component';
import { FacturaComponent } from '../../factura/factura.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'usuarios',        component: UsuariosComponent },
    { path: 'animales',        component: AnimalesComponent },
    { path: 'citas',        component: CitasComponent },
    { path: 'factura',        component: FacturaComponent }
];
