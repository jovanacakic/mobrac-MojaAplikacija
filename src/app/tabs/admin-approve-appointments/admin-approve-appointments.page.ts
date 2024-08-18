import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../services/admin.service";
import {map, Observable, take} from "rxjs";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-admin-approve-appointments',
  templateUrl: './admin-approve-appointments.page.html',
  styleUrls: ['./admin-approve-appointments.page.scss'],
})
export class AdminApproveAppointmentsPage implements OnInit {

  bookedAppointments: any[] = [];

  constructor(private adminService: AdminService, private alertCtrl: AlertController) {
  }


  // ngOnInit() {
  //
  //   this.adminService.getAllBookedAppointments().subscribe(
  //     (appointments) => {
  //       this.bookedAppointments = appointments;
  //       console.log(this.bookedAppointments);
  //     },
  //     error => {
  //       console.error('Error fetching booked appointments:', error);
  //     }
  //   );
  // }

  userNames: { [userId: string]: string } = {}; // Skladištenje korisničkih imena po userID


  ngOnInit() {
    this.adminService.getAllBookedAppointments().subscribe(
      (appointments) => {
        this.bookedAppointments = appointments;
        this.fetchUserNames(); // Poziva metodu za dohvatanje korisničkih imena
      },
      error => {
        console.error('Error fetching booked appointments:', error);
      }
    );
  }

  fetchUserNames() {
    // Dohvatanje korisničkih imena za svaki booked appointment
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
            // Korisnik je odustao od odobravanja
          }
        },
        {
          text: 'Yes',
          handler: () => {
            // Ažurirajte UI odmah
            appointment.slot.status = 'approved';
            // Pozovite servis da ažurira podatke na serveru
            return this.adminService.approveTimeSlot(appointment.year, appointment.month, appointment.day, appointment.index).subscribe(
              () => {
                this.removeAppointment(appointment.year, appointment.month, appointment.day, appointment.index);
                this.fetchUserNames();
                this.presentApprovalSuccessAlert();
              },
              (error) => {
                // U slučaju greške, vratite originalni status ili obavestite korisnika
                appointment.slot.status = 'booked';
                this.presentErrorAlert();
                console.error('Error approving appointment:', error);
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

  approveAppointment(appointment: any) {
    const datePath = `${appointment.year}/${appointment.month}/${appointment.day}`;
    const slotIndex = appointment.index; // Pretpostavka da imate indeks time slota

    return this.adminService.approveTimeSlot(appointment.year, appointment.month, appointment.day, slotIndex).subscribe({
      next: () => {
        console.log('Appointment approved successfully');
        // Ovde možete ažurirati UI ili izvršiti dodatne akcije nakon uspešnog odobravanja
      },
      error: (err) => {
        console.error('Failed to approve appointment', err);
      }
    });
  }

  onApproveAppointment(bookedAppointment: any) {
    this.presentApprovalAlert(bookedAppointment);
  }

  removeAppointment(year: string, month: string, day: string, index: number) {
    this.bookedAppointments = this.bookedAppointments.filter(appointment =>
      !(appointment.year === year && appointment.month === month && appointment.day === day && appointment.index === index)
    );
  }
}
