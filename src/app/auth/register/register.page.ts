import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(private authService: AuthService, private router: Router, private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
  }

  ngOnInit() {
  }

  /* onRegister(registerForm: NgForm) {
     this.authService.register();
     this.router.navigate(['/tabs/home']);
   }*/
/*  onRegister(registerForm: NgForm) {
    this.loadingCtrl.create({message: 'Registering...'}).then((loadingEl) => {
      loadingEl.present();
      this.authService.register(registerForm.value).subscribe(resData => {
          console.log('Registracija uspela!');
          console.log(resData);

          loadingEl.dismiss();
          this.router.navigateByUrl('/tabs/home');
        },
        errRes => {
          console.log(errRes);
          loadingEl.dismiss();
          let message = 'Something went wrong during registration!';

          this.alertCtrl.create({
            header: 'Registration failed',
            message,
            buttons: ['Okay']
          }).then((alert) => {
            alert.present();
          });
          registerForm.reset();
        });
    });

  }*/
  onRegister(registerForm: NgForm) {
    this.loadingCtrl.create({ message: 'Registering...' }).then((loadingEl) => {
      loadingEl.present();
      this.authService.register({
        email: registerForm.value.email,
        password: registerForm.value.password,
        name: registerForm.value.name,
        surname: registerForm.value.surname,
        role: 'user',
        address: registerForm.value.address,
      }).subscribe(resData => {
          console.log('Registracija uspela!');
          console.log(resData);

          loadingEl.dismiss();
          this.router.navigateByUrl('/tabs/home');
        },
        errRes => {
          console.log(errRes);
          loadingEl.dismiss();
          let message = 'Something went wrong during registration!';

          this.alertCtrl.create({
            header: 'Registration failed',
            message,
            buttons: ['Okay']
          }).then((alert) => {
            alert.present();
          });
          registerForm.reset();
        });
    });
  }

}
