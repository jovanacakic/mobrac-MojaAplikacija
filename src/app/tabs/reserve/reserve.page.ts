import {Component, OnInit} from '@angular/core';
import {ReservationService} from "../../services/reservation.service";
import {Reservation} from "../reservation.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage implements OnInit {

  visaType: string | undefined;
  name: string | undefined;
  email: string | undefined;
  appointmentDate: string | undefined;
  reservations: Reservation[] = [];
  private reservationsSub: Subscription | undefined;

  constructor(private reservationService: ReservationService) {
  }

/*  onSubmit() {
    if (this.visaType && this.name && this.email && this.appointmentDate) {
      // Handle the form submission
      console.log('Form submitted with:', {
        visaType: this.visaType,
        name: this.name,
        email: this.email,
        appointmentDate: this.appointmentDate
      });

      // Reset the form (optional)
      this.visaType = '';
      this.name = '';
      this.email = '';
      this.appointmentDate = '';
    } else {
      console.log('Form is incomplete');
    }
  }*/

  ngOnInit() {
    this.reservationsSub = this.reservationService.reservations.subscribe(reservations => {
      this.reservations = reservations;
    });
  }

  onSubmit(visaType: string | undefined, appointmentDate: string | undefined) {
    this.reservationService.addReservation(visaType, appointmentDate).subscribe();
    // Resetovanje forme
    this.visaType = '';

    this.appointmentDate = '';
  }


  ngOnDestroy() {
    if (this.reservationsSub) {
      this.reservationsSub.unsubscribe();
    }
  }
}
