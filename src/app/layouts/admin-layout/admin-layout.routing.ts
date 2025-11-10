import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { AnimalesComponent } from '../../animales/animales.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { FacturaComponent } from '../../factura/factura.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'animales',        component: AnimalesComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'factura',        component: FacturaComponent }
];
