import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {catchError, map, Observable, of, switchMap, take, tap, throwError} from "rxjs";

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

  getAllBookedAppointments(): Observable<any[]> {
    return this.authService.token.pipe(
      switchMap(token => {
        const url = `${this.baseUrl}/appointments.json?auth=${token}`;
        return this.http.get<any>(url).pipe(
          map(responseData => {
            const bookedAppointments: any[] = [];
            if (responseData) {
              Object.keys(responseData).forEach(year => {
                Object.keys(responseData[year]).forEach(month => {
                  Object.keys(responseData[year][month]).forEach(day => {
                    // Uzeti niz timeSlots za dati dan
                    const timeSlots = responseData[year][month][day]['timeSlots'];
                    // Proveriti da li postoji niz timeSlots
                    if (timeSlots && Array.isArray(timeSlots)) {
                      // Proći kroz svaki time slot
                      timeSlots.forEach((slot, index) => {
                        if (slot.status === 'booked') {
                          bookedAppointments.push({
                            year,
                            month,
                            day,
                            slot,
                            index
                          });
                        }
                      });
                    }
                  });
                });
              });
            }
            return bookedAppointments;
          })
        );
      })
    );
  }

  getUser(userID: string) {
    return this.authService.token.pipe(
      switchMap(token => {
        // Direktno dohvatite korisnika po ID-u
        const url = `${this.baseUrl}/users/${userID}.json?auth=${token}`;
        return this.http.get<any>(url).pipe(
          take(1),
          // map(user => {
          //   // Ako korisnik ne postoji ili nema potrebne atribute, vratite neku podrazumevanu vrednost ili obavestite o grešci
          //   if (!user || !user.firstName || !user.lastName) {
          //     return 'User not found or incomplete data';
          //   }
          //   console.log(user);
          //   //return user.firstName + ' ' + user.lastName;
          // }),
          catchError(error => {
            // Upravljanje greškama, npr. logovanje i vraćanje pristojne poruke
            console.error('Error fetching user:', error);
            return of('Error fetching user');
          })
        );
      })
    );
  }

  approveTimeSlot(year: string, month: string, day: string, slotIndex: number): Observable<any> {
    // const url = `${this.baseUrl}/appointments/${datePath}/timeSlots/${slotIndex}.json`;
    // return this.http.patch(url, { status: 'approved' }); // Pretpostavlja se da koristite PATCH za ažuriranje
    return this.authService.token.pipe(
      switchMap(token => {
        // Ažuriranje time slota
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const slotUpdateUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/appointments/${year}/${formattedMonth}/${formattedDay}/timeSlots/${slotIndex}.json?auth=${token}`;
        return this.http.patch(slotUpdateUrl, {status: 'approved'});
      })
    );
  }
  declineTimeSlot(year: string, month: string, day: string, slotIndex: number): Observable<any> {
    // const url = `${this.baseUrl}/appointments/${datePath}/timeSlots/${slotIndex}.json`;
    // return this.http.patch(url, { status: 'approved' }); // Pretpostavlja se da koristite PATCH za ažuriranje
    return this.authService.token.pipe(
      switchMap(token => {
        // Ažuriranje time slota
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const slotUpdateUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/appointments/${year}/${formattedMonth}/${formattedDay}/timeSlots/${slotIndex}.json?auth=${token}`;
        return this.http.patch(slotUpdateUrl, {status: 'available', userId: null });
      })
    );
  }

  updateReservationToApproved(year: any, month: any, day: any, slot: any): Observable<any> {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const date = `${year}-${formattedMonth}-${formattedDay}`;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        const reservationsUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}&orderBy="appointmentDate"&equalTo="${date}"`;
        return this.http.get<{ [key: string]: any }>(reservationsUrl).pipe(
          map(reservations => {
            if (!reservations) {
              throw new Error('No reservations found for the given date');
            }
            const reservationKey = Object.keys(reservations).find(key => reservations[key].timeSlot.startTime === slot.startTime);
            if (!reservationKey) {
              throw new Error('No matching slot found');
            }
            return { key: reservationKey, token: token };
          }),
          switchMap(({ key, token }) => {
            const updatePath = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations/${key}/timeSlot.json?auth=${token}`;
            return this.http.patch(updatePath, { status: 'approved' });
          })
        );
      }),
      catchError(error => {
        console.error("Greška u RxJS lancu:", error);
        return throwError(() => new Error('Update failed: ' + error));
      })
    );
  }
  updateReservationToDeclined(year: any, month: any, day: any, slot: any): Observable<any> {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const date = `${year}-${formattedMonth}-${formattedDay}`;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        const reservationsUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}&orderBy="appointmentDate"&equalTo="${date}"`;
        return this.http.get<{ [key: string]: any }>(reservationsUrl).pipe(
          map(reservations => {
            if (!reservations) {
              throw new Error('No reservations found for the given date');
            }
            const reservationKey = Object.keys(reservations).find(key => reservations[key].timeSlot.startTime === slot.startTime);
            if (!reservationKey) {
              throw new Error('No matching slot found');
            }
            return { key: reservationKey, token: token };
          }),
          switchMap(({ key, token }) => {
            const updatePath = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations/${key}/timeSlot.json?auth=${token}`;
            return this.http.patch(updatePath, { status: 'declined' });
          })
        );
      }),
      catchError(error => {
        console.error("Greška u RxJS lancu:", error);
        return throwError(() => new Error('Update failed: ' + error));
      })
    );
  }
}
