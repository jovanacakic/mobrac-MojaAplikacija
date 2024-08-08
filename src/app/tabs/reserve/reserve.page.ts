import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  onSubmit() {
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
  }

  ngOnInit() {
  }

}
