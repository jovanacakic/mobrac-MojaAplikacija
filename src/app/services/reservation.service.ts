import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Reservation} from "../tabs/reservation.model";
import {BehaviorSubject, Observable, map, switchMap, take, tap} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {TimeSlot} from '../tabs/time-slot.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private baseUrl = 'https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  private _reservations = new BehaviorSubject<Reservation[]>([]);

  get reservations() {
    return this._reservations.asObservable();
  }


  /*  getReservations(): void {
      this.http.get<{ [key: string]: Reservation }>(this.baseUrl).pipe(
        map(responseData => {
          const reservationsArray: Reservation[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              reservationsArray.push({...responseData[key], id: key});
            }
          }
          return reservationsArray;
        })
      ).subscribe(reservations => {
        this._reservations.next(reservations);
      });
    }*/
  getReservations(): void {
    this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: Reservation }>(
          `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}`
        );
      }),
      switchMap(responseData => {
        return this.authService.userId.pipe(
          take(1),
          map(userId => {
            const reservationsArray: Reservation[] = [];
            for (const key in responseData) {
              if (responseData.hasOwnProperty(key) && responseData[key].userId === userId) {
                reservationsArray.push({...responseData[key], id: key});
              }
            }
            return reservationsArray;
          })
        );
      })
    ).subscribe(reservations => {
      this._reservations.next(reservations);
    });
  }

  /*  addReservation(visaType: string | undefined, appointmentDate: string | undefined) {
      const newReservation: Reservation = {
        id: '', // ID će biti postavljen od strane Firebase-a
        // @ts-ignore
        visaType,
        // @ts-ignore
        appointmentDate,
        /!*!// @ts-ignore
        userId*!/
      };

      return this.http.post<{ name: string }>(
        `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json`,
        newReservation
      ).pipe(
        tap((resData) => {
          newReservation.id = resData.name; // Firebase vraća generisani ID u 'name'
          this._reservations.next([...this._reservations.getValue(), newReservation]);
        })
      );
    }*/
  addReservation(visaType: string | undefined, appointmentDate: string | undefined, startTime: string, endTime: string) {
    let generatedId: string;
    let newReservation: Reservation;

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.authService.userId.pipe(
          take(1),
          map(userId => {
            if (!userId || !token) {
              throw new Error('User not authenticated!');
            }

            newReservation = {
              id: '', // ID će biti postavljen od strane Firebase-a
              // @ts-ignore
              visaType,
              // @ts-ignore
              timeSlot,
              userId
            };

            return {userId, token};
          }),
          switchMap(({token}) => {
            const url = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}`;
            return this.http.post<{ name: string }>(url, newReservation);
          })
        );
      }),
      tap(resData => {
        generatedId = resData.name; // Firebase vraća generisani ID u 'name'
        newReservation.id = generatedId;
        this._reservations.next([...this._reservations.getValue(), newReservation]);
      })
    );
  }

  deleteReservation(reservationId: string) {
    return this.authService.token.pipe(
      switchMap(token => {
        return this.http.delete(
          `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations/${reservationId}.json?auth=${token}`
        );
      }),
      tap(() => {
        const updatedReservations = this._reservations.getValue().filter(r => r.id !== reservationId);
        this._reservations.next(updatedReservations);
      })
    );
  }

  getTimeSlots(): Observable<TimeSlot[]> {
    return this.authService.token.pipe(
      switchMap(token => {
        return this.http.get<{ [key: string]: TimeSlot }>(
          `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/timeslots.json?auth=${token}`
        ).pipe(
          map(responseData => {
            const slotsArray: TimeSlot[] = [];
            for (const key in responseData) {
              if (responseData.hasOwnProperty(key)) {
                slotsArray.push({...responseData[key], id: key});
              }
            }
            return slotsArray;
          })
        );
      })
    );
  }


}
