import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Reservation} from "../tabs/reservation.model";
import {BehaviorSubject, Observable, map, switchMap, take, tap, catchError} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {TimeSlot} from '../tabs/time-slot.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private baseUrl = 'https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app';

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
  // addReservation(visaType: string | undefined, timeSlot: TimeSlot, date: string | undefined) {
  //   let generatedId: string;
  //   let newReservation: Reservation;
  //
  //   return this.authService.token.pipe(
  //     take(1),
  //     switchMap(token => {
  //       return this.authService.userId.pipe(
  //         take(1),
  //         map(userId => {
  //           if (!userId || !token) {
  //             throw new Error('User not authenticated!');
  //           }
  //
  //            newReservation = {
  //             id: '',
  //             visaType: visaType,
  //             appointmentDate: date,
  //             timeSlot: {
  //               id: timeSlot.id,
  //               status: timeSlot.status,
  //               date: timeSlot.date,
  //               startTime: timeSlot.startTime,
  //               endTime: timeSlot.endTime,
  //               isAvailable: timeSlot.isAvailable
  //             },
  //             userId: userId
  //           };
  //
  //           return {userId, token};
  //         }),
  //         switchMap(({token}) => {
  //           console.log("Sending reservation data:", newReservation);
  //
  //           const url = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}`;
  //           return this.http.post<{ name: string }>(url, newReservation);
  //         })
  //       );
  //     }),
  //     tap(resData => {
  //       generatedId = resData.name; // Firebase vraća generisani ID u 'name'
  //       newReservation.id = generatedId;
  //       this._reservations.next([...this._reservations.getValue(), newReservation]);
  //     })
  //   );
  // }

  addReservation(visaType: string | undefined, date: string | undefined, timeSlot: TimeSlot) {
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
              id: '',
              visaType: visaType,
              appointmentDate: date,
              timeSlot: {
                id: timeSlot.id,
                status: timeSlot.status,
                date: timeSlot.date,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                isAvailable: timeSlot.isAvailable,
                index: timeSlot.index,
              },
              userId: userId
            };

            return {newReservation, token};
          }),
          switchMap(({token}) => {
            console.log("Sending reservation data:", newReservation);
            const url = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}`;
            return this.http.post<{ name: string }>(url, newReservation);
          }),
          switchMap(resData => {
            generatedId = resData.name; // Firebase vraća generisani ID u 'name'
            newReservation.id = generatedId;

            // @ts-ignore
            const slotUpdateUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/appointments/${date.split('-')[0]}/${date.split('-')[1]}/${date.split('-')[2]}/timeSlots/${timeSlot.index}.json?auth=${token}`;
            return this.http.patch(slotUpdateUrl, { status: 'booked', userId: newReservation.userId, visaType: visaType });
          })
        );
      }),
      tap(() => {
        this._reservations.next([...this._reservations.getValue(), newReservation]);
      })

    );
  }

  deleteReservation(reservationId: string, date:string, timeSlot: TimeSlot) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        // Prvo brisanje rezervacije
        const deleteUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations/${reservationId}.json?auth=${token}`;
        return this.http.delete(deleteUrl).pipe(
          tap(() => {
            // Ažuriranje lokalnog stanja rezervacija
            const updatedReservations = this._reservations.getValue().filter(r => r.id !== reservationId);
            this._reservations.next(updatedReservations);
          }),
          map(() => token)  //ovo prosledjuje token dalje u lanac
        );
      }),
      switchMap(token => {
        //Ažuriranje time slota u appointments tabeli
        // @ts-ignore stavljamo jer ce biti time slota
        const [year, month, day] = date.split('-');
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const slotUpdateUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/appointments/${year}/${formattedMonth}/${formattedDay}/timeSlots/${timeSlot.index}.json?auth=${token}`;
        return this.http.patch(slotUpdateUrl, { status: 'available', userId: null });
      })
    );
  }

  // getTimeSlotsByDate(date: string): Observable<{ date: string, timeSlots: TimeSlot[] } | null> {
  //   return this.authService.token.pipe(
  //     switchMap(token => {
  //       // Razdvajanje datuma na komponente
  //       const [year, month, day] = date.split('-').map(Number);
  //       // Prilagođavanje URL-a da uključi godinu, mesec i dan
  //       const url = `${this.baseUrl}/appointments/${year}/${month}/${day}.json?auth=${token}`;
  //       return this.http.get<{ timeSlots: TimeSlot[] }>(url).pipe(
  //         map(responseData => {
  //           if (responseData && responseData.timeSlots) {
  //             return {
  //               date: date,
  //               timeSlots: responseData.timeSlots.filter(slot => slot.status === 'available')
  //             };
  //           }
  //           return null;
  //         })
  //       );
  //     })
  //   );
  // }
  getTimeSlotsByDate(date: string): Observable<{ date: string, timeSlots: TimeSlot[] } | null> {
    return this.authService.token.pipe(
      take(1), //dodala da ne bi bilo gressaka kad se logout proba probic
      switchMap(token => {

        const [year, month, day] = date.split('-').map(num => num.padStart(2, '0'));

        //const dayKey = `${(day + 1).toString().padStart(2, '0')}`;
        //const dayKey = parseInt(day,10);

        const url = `${this.baseUrl}/appointments/${year}/${month}/${day}.json?auth=${token}`;
        return this.http.get<{ timeSlots: TimeSlot[] }>(url).pipe(
          map(responseData => {
            if (responseData && responseData.timeSlots) {
              console.log("CONSOLE LOG U GETTIMESLOTSBYDATE "+responseData.timeSlots);
              return {
                date: date,
                timeSlots: responseData.timeSlots.filter(slot => slot.status === 'available'),
              };
            }
            return null;
          })
        );
      })
    );
  }
  // updateReservationToApproved(year: any, month: any, day: any, slot: any): Observable<any> {
  //   return this.authService.token.pipe(
  //     switchMap(token => {
  //       const formattedMonth = month.toString().padStart(2, '0');
  //       const formattedDay = day.toString().padStart(2, '0');
  //       // Kreiranje URL-a za ažuriranje specifičnog time slota
  //       const slotUpdateUrl = `${this.baseUrl}/reservations/${year}/${formattedMonth}/${formattedDay}/timeSlots/${slot.index}.json?auth=${token}`;
  //       // Ažuriranje statusa time slota na 'approved'
  //       return this.http.patch(slotUpdateUrl, { status: 'approved', userId: slot.userId });
  //     })
  //   );
  // }
  updateReservationToApproved(year: any, month: any, day: any, slot: any): Observable<any> {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const date = `${year}-${formattedMonth}-${formattedDay}`;
    return this.authService.token.pipe(
      tap(token => console.log("Token:", token)),
      take(1),
      switchMap(token => {
        const reservationsUrl = `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/reservations.json?auth=${token}&orderBy="appointmentDate"&equalTo="${date}"`;
        console.log("URL: ", reservationsUrl);
        return this.http.get<{ [key: string]: any }>(reservationsUrl).pipe(
          switchMap(reservations => {
            console.log(reservations);
            if (!reservations) {
              throw new Error('No reservations found for the given date');
            }
            const updates: any = {};
            Object.keys(reservations).forEach(key => {
              const reservation = reservations[key];
              if (reservation.timeSlot.startTime === slot.startTime) {
                const updatePath = `/reservations/${key}/timeSlot/status.json`;
                updates[updatePath] = 'approved';
              }
            });
            if (Object.keys(updates).length > 0) {
              return this.http.patch(`${this.baseUrl}/.json?auth=${token}`, updates);
            } else {
              throw new Error('No matching slot found');
            }
          })
        );
      }),
      catchError(error => {
        console.error("Greška u RxJS lancu:", error);
        throw error;
      })
    );
  }
}
