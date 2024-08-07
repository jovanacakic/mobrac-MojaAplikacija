import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(private authService: AuthService, private router : Router) { }

  ngOnInit() {
  }

  onRegister(registerForm: NgForm) {
    this.authService.login();
    this.router.navigate(['/tabs/reserve']);
  }
}
