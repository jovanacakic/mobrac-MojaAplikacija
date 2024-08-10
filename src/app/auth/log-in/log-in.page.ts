import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
})
export class LogInPage implements OnInit {

  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

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
      });
    }
  }
}
