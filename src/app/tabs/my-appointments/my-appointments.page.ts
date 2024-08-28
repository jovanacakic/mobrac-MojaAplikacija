import {Component, OnInit} from '@angular/core';
import {Reservation} from "../reservation.model";
import {Subscription} from 'rxjs';
import {ReservationService} from "../../services/reservation.service";
import {AlertController} from "@ionic/angular";
import {TimeSlot} from "../time-slot.model";

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.page.html',
  styleUrls: ['./my-appointments.page.scss'],
})
export class MyAppointmentsPage implements OnInit {

  reservations: Reservation[] = [];
  private reservationsSub: Subscription | undefined;

  constructor(private reservationService: ReservationService, private alertCtrl: AlertController) {
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

  onCancelReservation(reservationId: string, date: string | undefined, timeSlot: TimeSlot) {
    // @ts-ignore
    this.presentConfirmAlert(reservationId, date, timeSlot);
  }

  async presentConfirmAlert(reservationId: string, date: string, timeSlot: TimeSlot) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Cancellation',
      message: 'Are you sure you want to delete this reservation?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // Korisnik je potvrdio otkazivanje
            this.reservationService.deleteReservation(reservationId, date, timeSlot).subscribe(
              () => {
                this.reservations = this.reservations.filter(res => res.id !== reservationId);
                this.presentCancellationSuccessAlert();
              },
              (error) => {
                this.presentErrorAlert();
                console.error('Error deleting reservation:', error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async presentCancellationSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cancellation Successful',
      message: 'Your reservation has been successfully cancelled.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentErrorAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cancellation Failed',
      message: 'There was an error cancelling your reservation. Please try again later.',
      buttons: ['OK']
    });

    await alert.present();
  }

}
