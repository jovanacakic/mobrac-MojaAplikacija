import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCreateAppointmentsPage } from './admin-create-appointments.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCreateAppointmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAppointmentsPageRoutingModule {}
