import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Reservation} from "../tabs/reservation.model";
import {BehaviorSubject, map, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private _reservations = new BehaviorSubject<Reservation[]>([]);
  private baseUrl = 'https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json';

  constructor(private http: HttpClient) {
  }

  get reservations() {
    return this._reservations.asObservable();
  }


  getReservations(): void {
    this.http.get<{ [key: string]: Reservation }>(this.baseUrl).pipe(
      map(responseData => {
        const reservationsArray: Reservation[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            reservationsArray.push({ ...responseData[key], id: key });
          }
        }
        return reservationsArray;
      })
    ).subscribe(reservations => {
      this._reservations.next(reservations);
    });
  }

  addReservation(visaType: string | undefined, appointmentDate: string | undefined) {
    const newReservation: Reservation = {
      id: '', // ID će biti postavljen od strane Firebase-a
      // @ts-ignore
      visaType,
      // @ts-ignore
      appointmentDate,
      /*// @ts-ignore
      userId*/
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
  }
}
