import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { AnimalesComponent } from '../../animales/animales.component';
import { FacturaComponent } from '../../factura/factura.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ChartsModule,
    NgbModule,
    ToastrModule.forRoot(),
    HttpClientModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    AnimalesComponent,
    FacturaComponent
  ]
})

export class AdminLayoutModule {}
