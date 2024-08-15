import {TimeSlot} from "./time-slot.model";

export interface Reservation {
  id: string;
  visaType: string;
  //appointmentDate: Date;
  timeSlot: TimeSlot;
  userId: string;
}
