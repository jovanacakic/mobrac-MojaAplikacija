import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/auth.service";
import {AdminService} from "../../services/admin.service";

@Component({
  selector: 'app-admin-create-appointments',
  templateUrl: './admin-create-appointments.page.html',
  styleUrls: ['./admin-create-appointments.page.scss'],
})
export class AdminCreateAppointmentsPage implements OnInit {

  minDate: string;
  maxDate: string;

  wholeMonth: boolean = false;

  selectedDate: string;
  selectedMonth: string;

  constructor(private authService: AuthService, private adminService: AdminService) {

    this.selectedDate = new Date().toISOString();
    this.selectedMonth = new Date().toISOString();

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // stavljamo da min i max datum bude od danasnjeg meseca do decembra sledece godine
    this.minDate = new Date(currentYear, currentMonth, 1).toISOString();
    this.maxDate = new Date(currentYear + 1, 11, 31).toISOString();
  }

  ngOnInit() {
  }

  addAppointments() {

    const selectedMonth = new Date(this.selectedMonth);
    const selectedDate = new Date(this.selectedDate);

    if (this.wholeMonth) {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      this.adminService.generateAppointmentsForMonth(year, month).subscribe({
        next: () => {
          console.log('Appointments for the whole month were added successfully');
        },
        error: (err) => {
          console.error('Failed to add appointments', err);
        }
      });
    } else {
      //generisanje termina samo za odabrani dan
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      this.adminService.generateAppointmentsForDay(year, month, selectedDate.getDate()).subscribe({
        next: () => {
          console.log('Appointments for the selected day were added successfully');
        },
        error: (err) => {
          console.error('Failed to add appointments', err);
        }
      });
    }
  }
}
