import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminAppointmentsPageRoutingModule } from './admin-create-appointments-routing.module';

import { AdminCreateAppointmentsPage } from './admin-create-appointments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminAppointmentsPageRoutingModule
  ],
  declarations: [AdminCreateAppointmentsPage]
})
export class AdminAppointmentsPageModule {}
