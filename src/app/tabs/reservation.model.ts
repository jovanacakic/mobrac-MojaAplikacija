import {TimeSlot} from "./time-slot.model";

export interface Reservation {
  id: string;
  visaType: string | undefined;
  appointmentDate: string | undefined;
  timeSlot: TimeSlot;
  userId: string;
}
