import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {Observable, of, switchMap} from "rxjs";

interface TimeSlot {
  index: number
  startTime: string;
  endTime: string;
  status: string;
  userId: string | null;
}

interface DayAppointments {
  timeSlots: TimeSlot[];
}

interface MonthAppointments {
  [day: string]: DayAppointments;
}

interface YearAppointments {
  [month: string]: MonthAppointments;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = 'https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  generateAppointmentsForDay(year: number, month: number, day: number) {
    console.log(year, month, day);
    return this.authService.token.pipe(
      switchMap(token => {
        //unapred sam definisala kljuceve
        const monthKey = `${(month + 1).toString().padStart(2, '0')}`; // dodaje da umesto 8 bude 08
        const yearKey = `${year}`;
        const dayKey = `${day.toString().padStart(2, '0')}`;

        const date = new Date(year, month, day);
        if (date.getDay() !== 0 && date.getDay() !== 6) { //vikend
          const timeSlots: TimeSlot[] = [];
          let index = 0;

          for (let hour = 9; hour <= 15; hour++) {
            timeSlots.push({
              index: index,
              startTime: `${hour < 10 ? '0' + hour : hour}:00`,
              endTime: `${hour < 10 ? '0' + hour : hour}:30`,
              status: 'available',
              userId: null
            });
            index += 1;
            timeSlots.push({
              index: index,
              startTime: `${hour < 10 ? '0' + hour : hour}:30`,
              endTime: `${hour + 1 < 10 ? '0' + (hour + 1) : hour + 1}:00`,
              status: 'available',
              userId: null
            });
            index += 1;
          }

          //struktura
          const appointments = {[yearKey]: {[monthKey]: {[dayKey]: {timeSlots}}}};

          const path = `${this.baseUrl}/appointments/${yearKey}/${monthKey}/${dayKey}.json?auth=${token}`;
          return this.http.put(path, appointments[yearKey][monthKey][dayKey]);
        } else {
          return of({message: "No appointments can be booked on weekends."});
        }
      })
    );
  }

  generateAppointmentsForMonth(year: number, month: number) {
    return this.authService.token.pipe(
      switchMap(token => {
        const appointments: Record<string, YearAppointments> = {};
        const monthKey = `${(month + 1).toString().padStart(2, '0')}`;
        const yearKey = `${year}`;

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
          if (day.getDay() !== 0 && day.getDay() !== 6) { //bez vikenda
            const timeSlots: TimeSlot[] = [];
            let index = 0;

            for (let hour = 9; hour <= 15; hour++) {
              timeSlots.push({
                index: index,
                startTime: `${hour < 10 ? '0' + hour : hour}:00`,
                endTime: `${hour < 10 ? '0' + hour : hour}:30`,
                status: 'available',
                userId: null
              });
              index += 1;
              timeSlots.push({
                index: index,
                startTime: `${hour < 10 ? '0' + hour : hour}:30`,
                endTime: `${hour + 1 < 10 ? '0' + (hour + 1) : hour + 1}:00`,
                status: 'available',
                userId: null
              });
              index += 1;
            }

            const monthKey = `${(month + 1).toString().padStart(2, '0')}`;
            const dayKey = `${day.getDate().toString().padStart(2, '0')}`;
            const yearKey = `${year}`;

            if (!appointments[yearKey]) {
              appointments[yearKey] = {};
            }
            if (!appointments[yearKey][monthKey]) {
              appointments[yearKey][monthKey] = {};
            }
            appointments[yearKey][monthKey][dayKey] = {timeSlots};
          }
        }

        const path = `${this.baseUrl}/appointments/${yearKey}/${monthKey}.json?auth=${token}`;
        return this.http.patch(path, appointments[yearKey][monthKey]);
      })
    );
  }
}
