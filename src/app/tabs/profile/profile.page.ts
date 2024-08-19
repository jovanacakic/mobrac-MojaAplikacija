import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../auth/auth.service";
import {AlertController} from "@ionic/angular";
import {User} from "../../auth/user.model";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  //user: User;
  firstName: string | undefined;
  lastName: string | undefined;
  username: string | undefined;
  role: string | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.getUserProfile().subscribe((profile) => {
      this.firstName = profile.firstName;
      this.lastName = profile.lastName;
      this.username = profile.username;
    });
  }


  async presentLogoutConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.logOut();
          }
        }
      ]
    });

    await alert.present();
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['/log-in']);
  }
}
