import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, tap} from "rxjs";
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
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private _user = new BehaviorSubject<User | null>(null);

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

  login(user: UserData) {
    this._isUserAuthenticated = true;
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
      {email: user.email, password: user.password, returnSecureToken: true})
      .pipe(
        tap((userData) => {
          const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
          const user = new User(userData.localId, userData.email, userData.idToken, expirationTime);
          this._user.next(user);
        })
      );
  }

  register(user: UserData) {
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
  }


  logout() {
    this._user.next(null);
  }

  isLoggedIn(): boolean {
    return this._isUserAuthenticated;
  }

}
