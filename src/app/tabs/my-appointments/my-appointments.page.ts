import {Component, OnInit} from '@angular/core';
import {Reservation} from "../reservation.model";
import {Subscription} from 'rxjs';
import {ReservationService} from "../../services/reservation.service";

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.page.html',
  styleUrls: ['./my-appointments.page.scss'],
})
export class MyAppointmentsPage implements OnInit {

  reservations: Reservation[] = [];
  private reservationsSub: Subscription | undefined;

  constructor(private reservationService: ReservationService) {
  }

  ngOnInit() {
    this.reservationsSub = this.reservationService.reservations.subscribe(reservations => {
      this.reservations = reservations;
    });
    this.reservationService.getReservations();
  }

  ngOnDestroy() {
    if (this.reservationsSub) {
      this.reservationsSub.unsubscribe();
    }
  }

}
