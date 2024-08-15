import {Component, OnInit} from '@angular/core';
import {ReservationService} from "../../services/reservation.service";
import {Reservation} from "../reservation.model";
import {Subscription} from "rxjs";
import {AlertController} from "@ionic/angular";
import {TimeSlot} from "../time-slot.model";

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
  timeSlots: TimeSlot[] = [];
  private reservationsSub: Subscription | undefined;

  selectedTimeSlot: TimeSlot | undefined | null;

  constructor(private reservationService: ReservationService, private alertCtrl: AlertController) {
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

  async presentReservationAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Reservation Successful',
      message: 'Your appointment has been successfully reserved.',
      buttons: ['OK']
    });

    await alert.present();
  }

  ngOnInit() {
    this.reservationsSub = this.reservationService.reservations.subscribe(reservations => {
      this.reservations = reservations;
    });
    this.reservationService.getTimeSlots().subscribe(slots => {
      this.timeSlots = slots.filter(slot => slot.isAvailable);
    });
  }

  onSubmit(visaType: string | undefined) {
    if (this.selectedTimeSlot) {
      this.reservationService.addReservation(visaType, this.selectedTimeSlot.date, this.selectedTimeSlot.startTime, this.selectedTimeSlot.endTime).subscribe(() => {
        this.presentReservationAlert();
      });
      // Resetovanje forme
      this.visaType = '';
      this.selectedTimeSlot = null;
    }
  }



  ngOnDestroy() {
    if (this.reservationsSub) {
      this.reservationsSub.unsubscribe();
    }
  }
}
