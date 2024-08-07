import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ReservePageRoutingModule} from './reserve-routing.module';

import {ReservePage} from './reserve.page';
import {MyAppointmentsPageModule} from "../my-appointments/my-appointments.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReservePageRoutingModule,
    MyAppointmentsPageModule
  ],
  declarations: [ReservePage]
})
export class ReservePageModule {
}
