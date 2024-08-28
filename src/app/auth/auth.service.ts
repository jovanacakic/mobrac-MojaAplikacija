import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, switchMap, take, tap} from "rxjs";
import {User} from "./user.model";
import {environment} from "../../environments/environment";

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

interface UserData {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: string;
  address: string
  //ionicrole: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private _user = new BehaviorSubject<User | null>(null);
  private _isAdmin = false;

  constructor(private http: HttpClient) {
  }

  private _isUserAuthenticated = false;

  get isUserAuthenticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get isUserAdmin() {
    return this._isAdmin;
  }

  get userId() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  setRole(email: string, password: string): string {
    if (email === "admin@gmail.com" && password === "7654321") {
      return "admin";
    } else {
      return "user";
    }
  }


  login(user: UserData) {
    this._isUserAuthenticated = true;
    const userRole = this.setRole(user.email, user.password);

    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
      {email: user.email, password: user.password, returnSecureToken: true})
      .pipe(
        tap((userData) => {

          if (userRole === "admin") {
            this._isAdmin = true;
            localStorage.setItem("isAdmin", "true");
          } else {
            this._isAdmin = false;
          }

          const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
          const user = new User(userData.localId, userData.email, userRole, userData.idToken, expirationTime);
          this._user.next(user);
        })
      );
  }

  /*  register(user: UserData) {
      this._isUserAuthenticated = true;
      return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        {email: user.email, password: user.password, returnSecureToken: true})
        .pipe(
          tap((userData) => {
            const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
            const user = new User(userData.localId, userData.email, userData.idToken, expirationTime);
            this._user.next(user);
          })
        );
    }*/

  register(user: UserData) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      {
        email: user.email,
        password: user.password,
        returnSecureToken: true
      }
    ).pipe(
      tap((userData) => {
        const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
        const newUser = new User(userData.localId, userData.email, 'user', userData.idToken, expirationTime, user.name, user.surname);
        this._user.next(newUser);

        this.http.put(
          `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/users/${userData.localId}.json?auth=${userData.idToken}`,
          {
            firstName: user.name,
            lastName: user.surname,
            username: user.email,
            role: user.role,
            address: user.address
          }
        ).subscribe();
      })
    );
  }

  logout() {
    this._user.next(null);
  }

  getUserProfile() {
    return this.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User not found');
        }
        return this.http.get<{ firstName: string; lastName: string; username: string, address: string }>(
          `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json?auth=${this._user.getValue()?.token}`
        );
      })
    );
  }

  isLoggedIn(): boolean {
    return this._isUserAuthenticated;
  }

  updateUserAddress(address: string | undefined) {
    return this.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User not found');
        }
        return this.http.put<AuthResponseData>(
          `https://mobrac-mojaaplikacija-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json?auth=${this._user.getValue()?.token}`,
        {address: address});
      })
    );
  }
}
