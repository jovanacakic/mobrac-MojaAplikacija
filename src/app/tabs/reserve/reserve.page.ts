import {Component, OnInit} from '@angular/core';
import {ReservationService} from "../../services/reservation.service";
import {Reservation} from "../reservation.model";
import {map, Observable, Subscription, switchMap} from "rxjs";
import {AlertController} from "@ionic/angular";
import {TimeSlot} from "../time-slot.model";
import {AuthService} from "../../auth/auth.service";
import {HttpClient} from "@angular/common/http";

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

  constructor(private reservationService: ReservationService, private alertCtrl: AlertController, private authService: AuthService, private http: HttpClient) {
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
    this.loadTimeSlots();
  }


  ngOnDestroy() {
    if (this.reservationsSub) {
      this.reservationsSub.unsubscribe();
    }
  }

  selectSlot(slot: TimeSlot) {
    this.selectedTimeSlot = slot;
  }

  loadTimeSlots() {
    if (this.appointmentDate) {
      const selectedDate = this.appointmentDate.split('T')[0]; // Izdvaja datum u formatu YYYY-MM-DD
      this.reservationService.getTimeSlotsByDate(selectedDate).subscribe(slots => {
        console.log("Available slots:", slots);
        // @ts-ignore
        this.timeSlots = slots?.timeSlots;
        //this.timeSlots.date = selectedDate;
      });
    }
  }

  onDateChange() {
    if (this.appointmentDate) {
      const selectedDate = this.appointmentDate.split('T')[0]; // odsecanje da bude samo datum
      this.appointmentDate = selectedDate;  // azuriranje
      console.log('Selected date:', selectedDate);

      this.reservationService.getTimeSlotsByDate(selectedDate).subscribe(appointment => {
        this.timeSlots = appointment ? appointment.timeSlots.filter(slot => slot.status === 'available') : [];
        console.log('Available slots:', this.timeSlots);
      });
    }
  }

  onSubmit(visaType: string | undefined) {
    if (this.selectedTimeSlot) {

      this.selectedTimeSlot.status = 'booked';
      this.reservationService.addReservation(visaType, this.appointmentDate, this.selectedTimeSlot).subscribe(() => {
        this.presentReservationAlert();
      });
      this.visaType = '';
      this.selectedTimeSlot = null;
    }
  }


  async presentReservationAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Reservation Successful',
      message: 'Your appointment has been successfully reserved.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
