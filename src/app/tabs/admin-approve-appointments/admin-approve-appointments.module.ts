import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminApproveAppointmentsPageRoutingModule } from './admin-approve-appointments-routing.module';

import { AdminApproveAppointmentsPage } from './admin-approve-appointments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminApproveAppointmentsPageRoutingModule
  ],
  declarations: [AdminApproveAppointmentsPage]
})
export class AdminApproveAppointmentsPageModule {}
