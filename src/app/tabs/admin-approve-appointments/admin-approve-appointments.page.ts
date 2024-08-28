import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../services/admin.service";
import {map, Observable, switchMap, take, tap} from "rxjs";
import {AlertController} from "@ionic/angular";
import {ReservationService} from "../../services/reservation.service";

@Component({
  selector: 'app-admin-approve-appointments',
  templateUrl: './admin-approve-appointments.page.html',
  styleUrls: ['./admin-approve-appointments.page.scss'],
})
export class AdminApproveAppointmentsPage implements OnInit {

  bookedAppointments: any[] = [];

  constructor(private adminService: AdminService, private alertCtrl: AlertController, private reservationService: ReservationService) {
  }

  userNames: { [userId: string]: string } = {};


  ngOnInit() {
    this.adminService.getAllBookedAppointments().subscribe(
      (appointments) => {
        this.bookedAppointments = appointments;
        this.fetchUserNames();
      },
      error => {
        console.error('Error fetching booked appointments:', error);
      }
    );
  }

  fetchUserNames() {
    this.bookedAppointments.forEach(appointment => {
      if (appointment.slot.userId && !this.userNames[appointment.slot.userId]) {
        this.adminService.getUser(appointment.slot.userId).subscribe(
          (userInfo) => {
            this.userNames[appointment.slot.userId] = userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Unknown User';
          },
          error => {
            console.error('Error fetching user data:', error);
            this.userNames[appointment.slot.userId] = 'Error fetching user';
          }
        );
      }
    });
  }

  async presentApprovalAlert(appointment: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Approval',
      message: 'Are you sure you want to approve this appointment?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            appointment.slot.status = 'approved';
            this.adminService.approveTimeSlot(appointment.year, appointment.month, appointment.day, appointment.index).pipe(
              take(1), // dodato da ne bi izbacio eksepsn
              switchMap(() => {
                return this.adminService.updateReservationToApproved(appointment.year, appointment.month, appointment.day, appointment.slot);
              }),
              tap(() => {
                this.removeAppointmentFromListInHtml(appointment.year, appointment.month, appointment.day, appointment.index);
                this.fetchUserNames();
              })
            ).subscribe(
              () => {
                this.presentApprovalSuccessAlert();
              },
              error => {
                appointment.slot.status = 'booked'; //vracam na booked ako dodje do greske
                this.presentErrorAlert();
                console.error('Error during approval process:', error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async presentDeclinationAlert(appointment: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Declination',
      message: 'Are you sure you want to decline this appointment?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            appointment.slot.status = 'declined';
            this.adminService.declineTimeSlot(appointment.year, appointment.month, appointment.day, appointment.index).pipe(
              take(1), // dodala jer izbacuje exception
              switchMap(() => {
                return this.adminService.updateReservationToDeclined(appointment.year, appointment.month, appointment.day, appointment.slot);
              }),
              tap(() => {
                this.removeAppointmentFromListInHtml(appointment.year, appointment.month, appointment.day, appointment.index);
                this.fetchUserNames();
              })
            ).subscribe(
              () => {
                this.presentDeclinationSuccessAlert();
              },
              error => {
                appointment.slot.status = 'booked';
                this.presentErrorAlert();
                console.error('Error during declination process:', error);
              }
            );
          }

        }
      ]
    });

    await alert.present();
  }

  async presentApprovalSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Approval Successful',
      message: 'The reservation has been successfully approved.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentDeclinationSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Declination Successful',
      message: 'Your reservation has been successfully declined.',
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

  approveAppointment(appointment: any) {
    const datePath = `${appointment.year}/${appointment.month}/${appointment.day}`;
    const slotIndex = appointment.index;

    return this.adminService.approveTimeSlot(appointment.year, appointment.month, appointment.day, slotIndex).subscribe({
      next: () => {
        console.log('Appointment approved successfully');
      },
      error: (err) => {
        console.error('Failed to approve appointment', err);
      }
    });
  }

  onApproveAppointment(bookedAppointment: any) {
    this.presentApprovalAlert(bookedAppointment);
  }

  onDeclineAppointment(bookedAppointment: any) {
    this.presentDeclinationAlert(bookedAppointment);
  }

  removeAppointmentFromListInHtml(year: string, month: string, day: string, index: number) {
    this.bookedAppointments = this.bookedAppointments.filter(appointment =>
      !(appointment.year === year && appointment.month === month && appointment.day === day && appointment.index === index)
    );
  }
}
