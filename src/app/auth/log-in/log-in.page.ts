import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
})
export class LogInPage implements OnInit {

  isLoading = false;
  _isAdmin = false;

  constructor(private authService: AuthService, private router: Router, private alertCtrl: AlertController) {
  }

  ngOnInit() {
  }

  onLogin(logInForm: NgForm) {
    this.isLoading = true;
    console.log(logInForm);

    if (logInForm.valid) {
      this.authService.login(logInForm.value).subscribe(resData => {
          console.log('Uspesan login')
          console.log(resData);
          this.isLoading = false;
          this.router.navigateByUrl('/tabs/home');
        },
        errRes => {
          console.log(errRes);
          this.isLoading = false;
          let message = 'Incorrect email or password!';

          this.alertCtrl.create({
            header: 'Authentication failed',
            message,
            buttons: ['Okay']
          }).then((alert) => {
            alert.present();
          });
          logInForm.reset();
        });
    }
  }

}
